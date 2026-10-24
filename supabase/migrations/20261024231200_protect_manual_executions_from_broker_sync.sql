CREATE OR REPLACE FUNCTION public.replace_broker_executions_atomically(
    p_user_id uuid,
    p_account text,
    p_execution_dates text[],
    p_executions jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    inserted_count integer;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required';
    END IF;

    IF p_account IS NULL OR trim(p_account) = '' THEN
        RAISE EXCEPTION 'Account is required';
    END IF;

    IF p_execution_dates IS NULL
       OR array_length(p_execution_dates, 1) IS NULL THEN
        RAISE EXCEPTION 'Execution dates are required';
    END IF;

    IF p_executions IS NULL
       OR jsonb_typeof(p_executions) <> 'array' THEN
        RAISE EXCEPTION 'Executions must be a JSON array';
    END IF;

    -- Delete the matching broker window.
    -- Never delete Manual Entry executions.
    DELETE FROM public.executions
    WHERE user_id = p_user_id
      AND account = p_account
      AND date = ANY(p_execution_dates)
      AND (
          contract_key IS NULL
          OR contract_key NOT LIKE 'MANUAL-%'
      );

    -- Insert fresh normalized broker executions.
    INSERT INTO public.executions (
        id,
        broker_execution_id,
        date,
        execution_timestamp,
        ticker,
        contract,
        contract_key,
        exchange,
        action,
        side,
        quantity,
        execution_price,
        execution_value,
        fees,
        currency,
        fee_currency,
        account,
        asset_type,
        multiplier,
        user_id
    )
    SELECT
        x.id,
        x.broker_execution_id,
        x.date,
        x.execution_timestamp,
        x.ticker,
        x.contract,
        x.contract_key,
        x.exchange,
        x.action,
        x.side,
        x.quantity,
        x.execution_price,
        x.execution_value,
        x.fees,
        x.currency,
        x.fee_currency,
        x.account,
        x.asset_type,
        x.multiplier,
        p_user_id
    FROM jsonb_to_recordset(p_executions) AS x(
        id text,
        broker_execution_id text,
        date text,
        execution_timestamp text,
        ticker text,
        contract text,
        contract_key text,
        exchange text,
        action text,
        side text,
        quantity numeric,
        execution_price numeric,
        execution_value numeric,
        fees numeric,
        currency text,
        fee_currency text,
        account text,
        asset_type text,
        multiplier numeric
    );

    GET DIAGNOSTICS inserted_count = ROW_COUNT;

    RETURN inserted_count;
END;
$function$;