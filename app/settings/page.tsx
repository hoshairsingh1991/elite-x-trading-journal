"use client";

import {
  useEffect,
  useState,
} from "react";

import { supabase }
from "@/lib/supabase";

import Sidebar
from "@/components/layout/Sidebar";

import Topbar
from "@/components/layout/Topbar";

import {
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";

const tabs = [
  "Profile",
  "Security",
  "Accounts",
  "Import",
  "Broker Sync",
  "Subscription",
  "Billing",
  "Support",
];

export default function SettingsPage() {

  const [
    brokerConnections,
    setBrokerConnections,
  ] = useState<any[]>([]);

const [
  viewportSize,
  setViewportSize,
] = useState({
  width: 0,
  height: 0,
});

  const [
    isEditModalOpen,
    setIsEditModalOpen,
  ] = useState(false);

  const [
    selectedBroker,
    setSelectedBroker,
  ] = useState<any>(null);

  const [
  modalMode,
  setModalMode,
] = useState<"add" | "edit">("edit");

  const [
    editAccountAlias,
    setEditAccountAlias,
  ] = useState("");

  const [
    editQueryId,
    setEditQueryId,
  ] = useState("");

  const [
    editFlexToken,
    setEditFlexToken,
  ] = useState("");

  const [
  editBrokerAccountId,
  setEditBrokerAccountId,
] = useState("");

const [
  isSyncing,
  setIsSyncing,
] = useState(false);

const [
  showFlexToken,
  setShowFlexToken,
] = useState(false);

// =====================================
// SYNC ALL BROKERS
// =====================================

const handleSyncNow = async () => {

  try {

    setIsSyncing(true);

    const {
      data: {
        session,
      },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {

      console.error(
        "NO AUTHENTICATED SESSION"
      );

      return;
    }

    const response =
      await fetch(
        "/api/sync-all-brokers",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${session.access_token}`,
          },
        }
      );

    const data =
      await response.json();

    console.log(
      "SYNC RESULT:",
      data
    );

    if (!response.ok || !data.success) {

      console.error(
        "SYNC FAILED:",
        data
      );

      return;
    }

    // Refresh the page to reload broker data
    window.location.reload();

  } catch (error) {

    console.error(
      "SYNC FAILED:",
      error
    );

  } finally {

    setIsSyncing(false);
  }

};

// =====================================
// SAVE BROKER
// =====================================

const handleSaveBroker = async () => {

  // =====================================
  // ADD NEW BROKER
  // =====================================

  if (modalMode === "add") {

    const {
      data: authData,
    } = await supabase.auth.getUser();

    const user =
      authData.user;

    if (!user) {

      console.error(
        "NO AUTHENTICATED USER"
      );

      return;
    }

    const {
      data: newBroker,
      error,
    } = await supabase
      .from("broker_connections")


.insert({
  user_id: user.id,

  broker: "IBKR",

  account_alias:
    editAccountAlias.trim(),

  broker_account_id:
    editBrokerAccountId.trim(),

  flex_query_id:
    editQueryId.trim(),

  flex_token:
    editFlexToken.trim(),

  is_active: true,
})

.select(`
  id,
  user_id,
  broker,
  account_alias,
  broker_account_id,
  flex_query_id,
  is_active,
  created_at,
  updated_at,
  last_sync_at,
  last_sync_status,
  last_sync_error,
  last_sync_execution_count
`)
.single();

   if (error) {

  console.error(
    "BROKER INSERT ERROR:",
    error
  );

  return;
}

    setBrokerConnections([
      ...brokerConnections,
      newBroker,
    ]);

    setIsEditModalOpen(false);

    return;
  }

// =====================================
// EDIT EXISTING BROKER
// =====================================

if (!selectedBroker) {
  return;
}

const updatePayload: {
  account_alias: string;
  broker_account_id: string;
  flex_query_id: string;
  flex_token?: string;
} = {
  account_alias:
    editAccountAlias.trim(),

  broker_account_id:
    editBrokerAccountId.trim(),

  flex_query_id:
    editQueryId.trim(),
};

const newFlexToken =
  editFlexToken.trim();

if (newFlexToken) {
  updatePayload.flex_token =
    newFlexToken;
}

const { error } =
  await supabase
    .from("broker_connections")
    .update(updatePayload)
    .eq(
      "id",
      selectedBroker.id
    );

if (error) {

  console.error(
    "BROKER UPDATE ERROR:",
    error
  );

  return;
}

setBrokerConnections(

  brokerConnections.map(
    (broker) =>

      broker.id ===
      selectedBroker.id

        ? {
            ...broker,

            account_alias:
              editAccountAlias,

            broker_account_id:
              editBrokerAccountId,

            flex_query_id:
              editQueryId,
          }

        : broker
  )

);

setIsEditModalOpen(
  false
);

};

// =====================================
// VIEWPORT SIZE MONITOR
// =====================================

useEffect(() => {

  const updateViewportSize = () => {

    setViewportSize({
      width: window.innerWidth,
      height: window.innerHeight,
    });

  };

  updateViewportSize();

  window.addEventListener(
    "resize",
    updateViewportSize
  );

  return () => {

    window.removeEventListener(
      "resize",
      updateViewportSize
    );

  };

}, []);

  // =====================================
  // LOAD BROKER CONNECTIONS
  // =====================================

  useEffect(() => {

    const loadBrokerConnections =
      async () => {

const {
  data,
  error,
} = await supabase
  .from("broker_connections")
  .select(`
    id,
    user_id,
    broker,
    account_alias,
    broker_account_id,
    flex_query_id,
    is_active,
    created_at,
    updated_at,
    last_sync_at,
    last_sync_status,
    last_sync_error,
    last_sync_execution_count
  `);

        if (error) {

          console.log("UPDATE ERROR");
console.log(error);
console.log(JSON.stringify(error, null, 2));

          return;
        }

        setBrokerConnections(
          data || []
        );
      };

    loadBrokerConnections();

  }, []);

  return (

    <>

  <div
  className="
    flex
    min-h-screen
    bg-[#050816]
    text-white
    px-5
    py-5
    gap-5
  "
>

    {/* ===================================== */}
    {/* SIDEBAR */}
    {/* ===================================== */}

    <Sidebar />

    {/* ===================================== */}
    {/* MAIN CONTENT */}
    {/* ===================================== */}

   <div
  className="
    flex-1
    flex
    flex-col
    h-[calc(100vh-40px)]
  "
>

      {/* ===================================== */}
      {/* TOPBAR */}
      {/* ===================================== */}

      <Topbar />

{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[22px]" />

{/* ===================================== */}
{/* SETTINGS CONTENT */}
{/* ===================================== */}

<div
  className="
    flex-1
    rounded-[32px]
    border
    border-white/[0.04]
    bg-[#07101a]
    px-8
    pt-6
    pb-8
    shadow-[0_0_30px_rgba(0,0,0,0.22)]
  "
>

        {/* ===================================== */}
        {/* TOP TABS */}
        {/* ===================================== */}

        <div
  className="
    relative
    left-[20px]
    flex
    items-center
    gap-8
    border-b
    border-white/10
    mb-10
    overflow-x-auto
  "
>

          {tabs.map(
            (tab) => {

              const isActive =
                tab ===
                "Broker Sync";

              return (

                <button
                  key={tab}
                  className={`
                    pb-5
text-[16px]
font-medium
tracking-[-0.01em]
whitespace-nowrap
transition-all

                    ${
                      isActive
                        ? `
                          text-blue-400
                          border-b
                          border-blue-500
                        `
                        : `
                          text-zinc-500
                          hover:text-zinc-300
                        `
                    }
                  `}
                >
                  {tab}
                </button>
              );
            }
          )}

        </div>

        {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[6px]" />

        {/* ===================================== */}
        {/* PAGE HEADER */}
        {/* ===================================== */}

        <div
  className="
    relative
    left-[12px]
    mb-8
  "
>

          <h1
            className="
              text-2xl
              font-semibold
              tracking-tight
              mb-2
            "
          >
            Broker Sync
          </h1>

          <p
            className="
              text-zinc-400
              text-sm
            "
          >
            Manage broker integrations,
            Flex Web Service credentials,
            and execution synchronization.
          </p>

        </div>

        {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[8px]" />

        {/* ===================================== */}
        {/* PREMIUM CONTENT CARD */}
        {/* ===================================== */}

        <div
          className="
            rounded-3xl
            border
            border-white/10
            bg-gradient-to-b
            from-[#0B1220]
            to-[#09101C]
            shadow-2xl
            px-[34px]
            py-8
            min-h-[150px]
          "
        >


{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[6px]" />
          {/* ===================================== */}
          {/* CARD HEADER */}
          {/* ===================================== */}

          <div
  className="
    relative
    left-[12px]
    flex
    items-center
    justify-between
    mb-8
  "
>

            <div>

              <h2
                className="
                  text-xl
                  font-semibold
                  mb-1
                "
              >
                Connected Brokers
              </h2>

              <p
                className="
                  text-sm
                  text-zinc-400
                "
              >
                Configure and manage
                broker synchronization.
              </p>

            </div>

 <div
  className="
    relative
    right-[25px]
    flex
    items-center
    gap-3
  "
>

  <button
  onClick={handleSyncNow}
  disabled={isSyncing}
className="
inline-flex
items-center
justify-center
gap-2
w-[120px]
h-[40px]
rounded-xl
border
border-white/10
text-[16px]
font-semibold
transition-all
disabled:opacity-50
"
>
<RefreshCw
  className={`h-4 w-4 text-emerald-400 ${
    isSyncing
      ? "animate-spin"
      : ""
  }`}
/>

  <span>
    {isSyncing
      ? "Syncing..."
      : "Sync Now"}
  </span>
</button>

  <button
    onClick={() => {

      setModalMode("add");

      setSelectedBroker(null);

      setEditAccountAlias("");

      setEditQueryId("");

      setEditFlexToken("");

      setEditBrokerAccountId("");

      setIsEditModalOpen(true);

    }}
    className="
      inline-flex
      items-center
      justify-center
      w-[120px]
      h-[40px]
      rounded-xl
      bg-blue-600
      hover:bg-blue-500
      transition-all
      text-[16px]
      font-semibold
      tracking-[-0.01em]
    "
  >
    + Add Broker
  </button>

</div>

          </div>


          {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[8px]" />

          {/* ===================================== */}
          {/* BROKER TABLE */}
          {/* ===================================== */}

        <div className="px-[10px]">

  <div
  className="
    relative
    left-[10px]
    w-[99%]
    max-h-[140px]
    overflow-hidden
    rounded-xl
    border
    border-white/10
  "
>

    {/* TABLE */}

  </div>


           {/* TABLE HEADER */}

<div
  className="
    grid
    px-10
    py-3
    text-zinc-500
    border-b
    border-white/10
    bg-white/[0.02]
  "
  style={{
    gridTemplateColumns:
      "1fr 1fr 1fr 1fr 1fr 1fr",
  }}
>

  <div
  className="
    text-center
    text-[18px]
    font-semibold
  "
>
  Broker
</div>

  <div
  className="
    text-center
    text-[18px]
    font-semibold
    "
  >
    Account
  </div>

  <div
  className="
    text-center
    text-[18px]
    font-semibold
    "
  >
    Status
  </div>

  <div
  className="
    text-center
    text-[18px]
    font-semibold
    "
  >
    Query ID
  </div>

  <div
  className="
    text-center
    text-[18px]
    font-semibold
    "
  >
    Last Sync
  </div>

 <div
  className="
    text-center
    text-[18px]
    font-semibold
    "
>
  Actions
</div>

</div>


{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[4px]" />    

           {/* TABLE ROWS */}

{brokerConnections.map(
  (connection) => {

    return (

      <div
        key={connection.id}
        className="
          grid
          grid-cols-6
          items-center
          px-10
          py-3
          border-b
          border-white/5
        "
      >

        {/* BROKER */}

        <div
          className="
            text-center
            text-[14px]
            font-semibold
          "
        >
          {connection.broker}
        </div>

        {/* ACCOUNT */}

        <div
          className="
            text-center
            text-[14px]
            text-zinc-400
          "
        >
          <>
{connection.account_alias || "Primary"}

<span
  className="
    ml-2
    text-[14px]
    font-mono
    text-zinc-600
  "
>
  • {connection.broker_account_id}
</span>
</>
        </div>

        {/* STATUS */}

        <div
          className="
            flex
            justify-center
          "
        >

          <div
            className="
              inline-flex
              items-center
              gap-2
              text-emerald-400
              text-[12px]
              font-medium
            "
          >

            <div
              className="
                w-3
                h-3
                rounded-full
                bg-green-700
              "
            />

            CONNECTED

          </div>

        </div>

        {/* QUERY ID */}

        <div
          className="
            text-center
            text-zinc-400
            font-mono
            text-[14px]
          "
        >
          {connection.flex_query_id}
        </div>

        {/* LAST SYNC */}

<div
  className="
    flex
    items-center
    justify-center
    gap-2
    text-zinc-500
    text-[14px]
  "
>

  <div className="group relative">

<div
  className={`h-3 w-3 rounded-full ${
    connection.last_sync_status === "success"
      ? "bg-emerald-500"
      : connection.last_sync_status === "error"
        ? "bg-red-500"
        : "bg-slate-600"
  }`}
/>

  <div
    className="
      pointer-events-none
      absolute
      left-1/2
      top-[-12px]
      z-50
      hidden
      min-w-[220px]
      -translate-x-1/2
      -translate-y-full
      rounded-xl
      border
      border-white/[0.08]
      bg-[#071427]
      px-3
      py-2
      text-[12px]
      font-medium
      text-slate-300
      shadow-[0_0_25px_rgba(0,0,0,0.45)]
      group-hover:block
    "
  >

    {connection.last_sync_status === "success" ? (

  <div className="flex flex-col items-center">

    <div className="text-[14px] font-bold text-emerald-400">
      Sync Successful
    </div>

    <div className="mt-1 text-center text-[13px] text-slate-300">
      {connection.last_sync_execution_count ?? 0} Executions Processed
    </div>

  </div>

) : connection.last_sync_status === "error" ? (

  <div className="flex flex-col items-center">

    <div className="text-[14px] font-bold text-red-400">
      Sync Failed
    </div>

    <div className="mt-1 max-w-[220px] text-center text-[13px] text-slate-300">
      {connection.last_sync_error || "Unknown error"}
    </div>

  </div>

) : (

  <div className="text-center text-[13px] text-slate-400">
    Never Synced
  </div>

)}

  </div>

</div>

  <span>
    {connection.last_sync_at
      ? new Date(
          connection.last_sync_at
        ).toLocaleString()
      : "Never"}
  </span>

</div>

{/* ACTIONS */}

        <div
          className="
            flex
            items-center
            justify-center
            gap-3
          "
        >

          <button
onClick={() => {

  setModalMode("edit");

  setSelectedBroker(
    connection
  );

  setEditAccountAlias(
    connection.account_alias || ""
  );

  setEditBrokerAccountId(
    connection.broker_account_id || ""
  );

setEditQueryId(
  connection.flex_query_id || ""
);

setEditFlexToken("");

setIsEditModalOpen(
  true
);

}}
  className="
    text-zinc-400
    hover:text-white
    text-[16px]
    transition-all
  "
>
  Edit
</button>

        </div>

      </div>

      

    );
  }
)}

          </div>

        </div>

{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[14px]" />        

{/* ===================================== */}
{/* SETUP CARDS */}
{/* ===================================== */}

<div
  className="
    mt-8
    grid
    grid-cols-2
    gap-6
    px-4
  "
>

 {/* FLEX WEB SERVICE CARD */}

<div
  className="
    rounded-3xl
    border
    border-white/10
    bg-[#0B1220]
    p-8
    h-[360px]
  "
>
{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[12px]" />


  {/* ===================================== */}
  {/* FLEX WEB SERVICE ACTIVATION */}
  {/* ===================================== */}

  <div
    className="
      flex
      flex-col
      h-full
    "
  >

    {/* TITLE */}

    <h2
      className="
        text-center
        text-[20px]
        font-semibold
        text-white
        mb-3
      "
    >
      Flex Web Service Activation
    </h2>

    {/* SUBTITLE */}

    <p
      className="
        text-center
        text-[13px]
        text-zinc-400
        leading-relaxed
        px-8
        mb-10
      "
    >
      Activate the Interactive Brokers Flex Web Service
      and generate a token for automatic synchronization.
    </p>

    {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[12px]" />

    {/* STEPS */}

    <div
  className="
    relative
    left-[20px]
    text-[14px]
    flex
    flex-col
    gap-5
  "
>

      <div>
        <span className="font-semibold text-blue-400">
          Step 1:
        </span>{" "}
        Log in to your IBKR Client Portal.
      </div>

      <div>
        <span className="font-semibold text-blue-400">
          Step 2:
        </span>{" "}
        Navigate to Performance & Reports →
        Flex Queries.
      </div>

      <div>
        <span className="font-semibold text-blue-400">
          Step 3:
        </span>{" "}
        Open Flex Web Service Configuration.
      </div>

      <div>
        <span className="font-semibold text-blue-400">
          Step 4:
        </span>{" "}
        Enable Flex Web Service.
      </div>

      <div>
        <span className="font-semibold text-blue-400">
          Step 5:
        </span>{" "}
        Generate a New Token.
      </div>

      <div>
        <span className="font-semibold text-blue-400">
          Step 6:
        </span>{" "}
        Select your preferred expiration period.
      </div>

      <div>
        <span className="font-semibold text-blue-400">
          Step 7:
        </span>{" "}
        Copy the generated token and paste it into
        Elite X.
      </div>

    </div>

  </div>

</div>

  {/* TRADE QUERY CARD */}

<div
  className="
    rounded-3xl
    border
    border-white/10
    bg-[#0B1220]
    p-8
    h-[360px]
  "
>

  {/* ===================================== */}
  {/* INVISIBLE SPACER */}
  {/* ===================================== */}

  <div className="h-[12px]" />

  {/* ===================================== */}
  {/* TRADE CONFIRMATION QUERY */}
  {/* ===================================== */}

  <div
    className="
      flex
      flex-col
      h-full
    "
  >

    {/* TITLE */}

    <h2
      className="
        text-center
        text-[20px]
        font-semibold
        text-white
        mb-3
      "
    >
      Trade Confirmation Query Setup
    </h2>

    {/* SUBTITLE */}

    <p
      className="
        text-center
        text-[13px]
        text-zinc-400
        leading-relaxed
        px-8
        mb-10
      "
    >
      Create a Trade Confirmation Flex Query and
      generate a Query ID for Elite X synchronization.
    </p>

    {/* ===================================== */}
    {/* INVISIBLE SPACER */}
    {/* ===================================== */}

    <div className="h-[12px]" />

    {/* STEPS */}

    <div
      className="
        relative
        left-[20px]
        text-[14px]
        flex
        flex-col
        gap-5
      "
    >

      <div>
        <span className="font-semibold text-blue-400">
          Step 1:
        </span>{" "}
        Log in to your IBKR Client Portal.
      </div>

      <div>
        <span className="font-semibold text-blue-400">
          Step 2:
        </span>{" "}
        Navigate to Performance & Reports →
        Flex Queries.
      </div>

      <div>
        <span className="font-semibold text-blue-400">
          Step 3:
        </span>{" "}
        Create a new Trade Confirmation Query.
      </div>

      <div>
        <span className="font-semibold text-blue-400">
          Step 4:
        </span>{" "}
        Name the query:
        <span className="text-blue-400">
          {" "}Elite X Trade Log
        </span>
      </div>

      <div>
        <span className="font-semibold text-blue-400">
          Step 5:
        </span>{" "}
        Select format:
        <span className="text-blue-400">
          {" "}CSV
        </span>
      </div>

      <div>
        <span className="font-semibold text-blue-400">
          Step 6:
        </span>{" "}
        Enable Trade Confirmation →
        Executions → Select All.
      </div>

      <div>
        <span className="font-semibold text-blue-400">
          Step 7:
        </span>{" "}
        Create the query and copy the Query ID
        into Elite X.
      </div>

    </div>

  </div>

</div>

</div>

    </div>

</div>

{/* ===================================== */}
{/* RIGHT SPACER */}
{/* ===================================== */}

<div className="w-[8px]" />

</div>

{isEditModalOpen && (

  <div
    className="
      fixed
      inset-0
      z-50
      flex
      items-center
      justify-center
      bg-black/70
      backdrop-blur-sm
    "
  >

    <div
      className="
        w-[600px]
        rounded-3xl
        border
        border-white/10
        bg-[#0B1220]
        shadow-2xl
        p-10
      "
    >

      {/* HEADER */}

      <h2
  className="
    text-center
    text-[28px]
    font-semibold
    text-white
    mb-12
  "
>
        Edit Broker
      </h2>

      {/* FORM */}

      <div
  className="
    relative
    space-y-10
  "
>


        {/* BROKER */}

        <div>

         <label
  className="
    relative
    left-[10px]
    block
    text-[20px]
    font-medium
    text-white
    mb-3
  "
>
  Broker
</label>

          <div
  className="
    relative
    left-[10px]
    w-[95%]
    rounded-xl
    bg-[#050816]
    border
    border-white/10
    py-4
  "
>
  <span
    className="
      relative
      left-[10px]
      text-white
    "
  >
    {selectedBroker?.broker}
  </span>
</div>

        </div>

        {/* ===================================== */}
    {/* INVISIBLE SPACER */}
    {/* ===================================== */}

    <div className="h-[12px]" />

        {/* ACCOUNT ALIAS */}

        <div>

          <label
            className="
    relative
    left-[10px]
    block
    text-[20px]
    font-medium
    text-white
    mb-3
            "
          >
            Account Alias
          </label>

          <input
  value={editAccountAlias}
  onChange={(e) =>
    setEditAccountAlias(
      e.target.value
    )
  }
  className="
    relative
    left-[10px]
    w-[95%]
    rounded-xl
    bg-[#050816]
    border
    border-white/10
    px-4
    py-4
    text-white
  "
/>


      </div>

{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[12px]" />

{/* BROKER ACCOUNT ID */}

<div>

  <label
    className="
      relative
      left-[10px]
      block
      text-[20px]
      font-medium
      text-white
      mb-3
    "
  >
    Broker Account ID
  </label>

  <input
    value={editBrokerAccountId}
    onChange={(e) =>
      setEditBrokerAccountId(
        e.target.value
      )
    }
    placeholder="e.g. U18458305"
    className="
      relative
      left-[10px]
      w-[95%]
      rounded-xl
      bg-[#050816]
      border
      border-white/10
      px-4
      py-4
      text-white
    "
  />

</div>

{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[12px]" />

{/* QUERY ID */}

<div>

  <label
    className="
      relative
      left-[10px]
      block
      text-[20px]
      font-medium
      text-white
      mb-3
    "
  >
    Query ID
  </label>

<input
  value={editQueryId}
  onChange={(e) =>
    setEditQueryId(
      e.target.value
    )
  }
  className="
    relative
    left-[10px]
    w-[95%]
    rounded-xl
    bg-[#050816]
    border
    border-white/10
    pl-[30px]
    py-4
    text-white
  "
/>
  

</div>

{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[12px]" />

{/* FLEX TOKEN */}

<label
  className="
    relative
    left-[10px]
    block
    text-[20px]
    font-medium
    text-white
    mb-3
  "
>
  Flex Token
</label>

<div
  className="
    relative
    left-[10px]
    w-[95%]
  "
>

  <input
    type={
      showFlexToken
        ? "text"
        : "password"
    }
    value={editFlexToken}
    placeholder={
      modalMode === "edit"
        ? "••••••••••••••••"
        : ""
    }
    onChange={(e) =>
      setEditFlexToken(
        e.target.value
      )
    }
    className="
      w-full
      rounded-xl
      bg-[#050816]
      border
      border-white/10
      px-4
      py-4
      pr-14
      text-white
      placeholder:text-slate-500
    "
  />

  <button
    type="button"
    onClick={async () => {

      // =====================================
      // HIDE TOKEN
      // =====================================

      if (showFlexToken) {

        setShowFlexToken(false);

        return;
      }

      // =====================================
      // ADD MODE
      // =====================================

      if (!selectedBroker) {

        setShowFlexToken(true);

        return;
      }

      // =====================================
      // TOKEN ALREADY LOADED
      // =====================================

      if (editFlexToken) {

        setShowFlexToken(true);

        return;
      }

      // =====================================
      // LOAD TOKEN SECURELY
      // =====================================

      try {

        const {
          data: {
            session,
          },
        } =
          await supabase.auth.getSession();

        if (
          !session?.access_token
        ) {

          console.error(
            "NO AUTHENTICATED SESSION"
          );

          return;
        }

        const response =
          await fetch(
            `/api/broker-connections/${selectedBroker.id}/token`,
            {
              method: "GET",
              headers: {
                Authorization:
                  `Bearer ${session.access_token}`,
              },
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {

          console.error(
            "FAILED TO LOAD FLEX TOKEN:",
            data
          );

          return;
        }

        setEditFlexToken(
          data.flexToken || ""
        );

        setShowFlexToken(true);

      } catch (error) {

        console.error(
          "FAILED TO LOAD FLEX TOKEN:",
          error
        );

      }

    }}
    className="
      absolute
      right-4
      top-1/2
      -translate-y-1/2
      text-slate-400
      hover:text-white
      transition-colors
    "
    aria-label={
      showFlexToken
        ? "Hide Flex Token"
        : "Show Flex Token"
    }
  >

    {showFlexToken ? (
      <EyeOff size={20} />
    ) : (
      <Eye size={20} />
    )}

  </button>

</div>

{/* ===================================== */}
    {/* INVISIBLE SPACER */}
    {/* ===================================== */}

    <div className="h-[15px]" />

      {/* BUTTONS */}

     <div
  className="
    relative
    right-[20px]
    flex
    justify-end
    gap-4
    mt-10
  "
>

        <button
          onClick={() =>
            setIsEditModalOpen(false)
          }
          className="
          w-[80px]
            px-5
            py-3
            rounded-xl
            border
            border-white/10
            text-zinc-300
            hover:text-white
          "
        >
          Cancel
        </button>

        <button
  onClick={handleSaveBroker}
  className="
    w-[120px]
    px-5
    py-3
    rounded-xl
    bg-blue-500
    hover:bg-blue-400
    text-white
    font-semibold
    transition-all
  "
>
  {modalMode === "add"
  ? "Add Broker"
  : "Save Changes"}
</button>

      </div>

{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[15px]" />

      </div>

    </div>

  </div>


)}

{/* ===================================== */}
{/* VIEWPORT SIZE MONITOR */}
{/* ===================================== */}

<div
  className="
    fixed
    bottom-3
    left-1/2
    z-[99999]
    -translate-x-1/2
    rounded-lg
    border
    border-white/[0.08]
    bg-[#050816]/95
    px-4
    py-2
    text-[12px]
    font-medium
    tracking-wide
    text-slate-400
    shadow-[0_4px_20px_rgba(0,0,0,0.35)]
    backdrop-blur-md
  "
>
  Viewport:&nbsp;
  <span className="text-white">
    {viewportSize.width} × {viewportSize.height}
  </span>
</div>

</>

);

}