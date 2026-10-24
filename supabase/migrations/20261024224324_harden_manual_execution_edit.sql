CREATE OR REPLACE FUNCTION public.replace_manual_executions_atomically(
  p_user_id uuid,
  p_delete_mode text,
  p_delete_execution_id text,
  p_contract_key text,
  p_executions jsonb
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  inserted_count integer;
  target_contract_key text;
BEGIN
  -- Validate required input.

  IF p_user_id IS NULL THEN
    RAISE EXCEPTION 'User ID is required';
  END IF;

  IF p_executions IS NULL
     OR jsonb_typeof(p_executions) <> 'array' THEN
    RAISE EXCEPTION 'Executions must be a JSON array';
  END IF;

  IF jsonb_array_length(p_executions) = 0 THEN
    RAISE EXCEPTION 'No replacement executions provided';
  END IF;

  -- Validate the existing edit target.

  IF p_delete_mode = 'execution_id' THEN

    IF p_delete_execution_id IS NULL
       OR trim(p_delete_execution_id) = '' THEN
      RAISE EXCEPTION 'Execution ID is required';
    END IF;

    SELECT e.contract_key
      INTO target_contract_key
    FROM public.executions AS e
    WHERE e.id = p_delete_execution_id
      AND e.user_id = p_user_id
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Existing manual execution was not found';
    END IF;

    IF target_contract_key IS NULL
       OR target_contract_key NOT LIKE 'MANUAL-%' THEN
      RAISE EXCEPTION 'Only manual executions can be edited';
    END IF;

  ELSIF p_delete_mode = 'contract_key' THEN

    IF p_contract_key IS NULL
       OR trim(p_contract_key) = '' THEN
      RAISE EXCEPTION 'Contract key is required';
    END IF;

    IF p_contract_key NOT LIKE 'MANUAL-%' THEN
      RAISE EXCEPTION 'Only manual trade lifecycles can be edited';
    END IF;

    target_contract_key := p_contract_key;

    PERFORM 1
    FROM public.executions AS e
    WHERE e.contract_key = target_contract_key
      AND e.user_id = p_user_id
      AND e.contract_key LIKE 'MANUAL-%'
    FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Existing manual lifecycle was not found';
    END IF;

  ELSE

    RAISE EXCEPTION 'Invalid delete mode';

  END IF;

  -- Ensure replacement executions preserve the target lifecycle.

  IF EXISTS (
    SELECT 1
    FROM jsonb_to_recordset(p_executions) AS x(
      contract_key text
    )
    WHERE x.contract_key IS DISTINCT FROM target_contract_key
  ) THEN
    RAISE EXCEPTION
      'Replacement executions must preserve the existing manual lifecycle';
  END IF;

  -- Delete only the validated manual target.

  IF p_delete_mode = 'execution_id' THEN

    DELETE FROM public.executions
    WHERE id = p_delete_execution_id
      AND user_id = p_user_id
      AND contract_key = target_contract_key
      AND contract_key LIKE 'MANUAL-%';

  ELSE

    DELETE FROM public.executions
    WHERE contract_key = target_contract_key
      AND user_id = p_user_id
      AND contract_key LIKE 'MANUAL-%';

  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Existing manual execution was not found';
  END IF;

  -- Insert replacement executions atomically.

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

  IF inserted_count = 0 THEN
    RAISE EXCEPTION 'No replacement executions were inserted';
  END IF;

  RETURN inserted_count;
END;
$function$;