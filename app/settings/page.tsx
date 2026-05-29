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
    isEditModalOpen,
    setIsEditModalOpen,
  ] = useState(false);

  const [
    selectedBroker,
    setSelectedBroker,
  ] = useState<any>(null);

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

  // =====================================
  // SAVE BROKER
  // =====================================

  const handleSaveBroker = async () => {

    if (!selectedBroker) {
      return;
    }

    const { error } = await supabase
      .from("broker_connections")
      .update({
        account_alias: editAccountAlias,
        flex_query_id: editQueryId,
        flex_token: editFlexToken,
      })
      .eq("id", selectedBroker.id);

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
          broker.id === selectedBroker.id
            ? {
                ...broker,
                account_alias:
                  editAccountAlias,
                flex_query_id:
                  editQueryId,
                flex_token:
                  editFlexToken,
              }
            : broker
      )
    );

    setIsEditModalOpen(false);
  };



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
          .from(
            "broker_connections"
          )
          .select("*");

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

<div className="h-[12px]" />

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
text-[20px]
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

<div className="h-[12px]" />

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
              text-3xl
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

<div className="h-[12px]" />

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

<div className="h-[12px]" />
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

            <button
  className="
  relative
  right-[25px]
  inline-flex
  items-center
  justify-center
  w-[150px]
  h-[40px]
  rounded-xl
  bg-blue-600
  hover:bg-blue-500
  transition-all
  text-[20px]
  font-semibold
  tracking-[-0.01em]
"
            >
              + Add Broker
            </button>

          </div>


          {/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[12px]" />

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
    text-[20px]
    font-semibold
  "
>
  Broker
</div>

  <div
  className="
    text-center
    text-[20px]
    font-semibold
    "
  >
    Account
  </div>

  <div
  className="
    text-center
    text-[20px]
    font-semibold
    "
  >
    Status
  </div>

  <div
  className="
    text-center
    text-[20px]
    font-semibold
    "
  >
    Query ID
  </div>

  <div
  className="
    text-center
    text-[20px]
    font-semibold
    "
  >
    Last Sync
  </div>

 <div
  className="
    text-center
    text-[20px]
    font-semibold
    "
>
  Actions
</div>

</div>


{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[2px]" />    

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
            text-[16px]
            font-semibold
          "
        >
          {connection.broker}
        </div>

        {/* ACCOUNT */}

        <div
          className="
            text-center
            text-[16px]
            text-zinc-400
          "
        >
          {connection.account_alias ||
            "Primary"}
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
              text-[15px]
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
            text-[16px]
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
    text-[16px]
  "
>

  <div
    title={
      connection.last_sync_status === "success"
        ? `Sync Successful • ${connection.last_sync_execution_count ?? 0} executions processed`
        : connection.last_sync_status === "failed"
        ? `Sync Failed • ${connection.last_sync_error || "Unknown error"}`
        : "Never Synced"
    }
    className={`
      h-3.5
      w-3.5
      rounded-full
      ${
        connection.last_sync_status === "success"
          ? "bg-emerald-600"
          : connection.last_sync_status === "failed"
          ? "bg-red-600"
          : "bg-zinc-600"
      }
    `}
  />

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
            className="
              text-blue-400
              hover:text-blue-300
              text-[16px]
              transition-all
            "
          >
            Sync
          </button>

          <button
  onClick={() => {

   setSelectedBroker(
  connection
);

setEditAccountAlias(
  connection.account_alias || ""
);

setEditQueryId(
  connection.flex_query_id || ""
);

setEditFlexToken(
  connection.flex_token || ""
);

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

<div className="h-[25px]" />        

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
    h-[400px]
  "
>
{/* ===================================== */}
{/* INVISIBLE SPACER */}
{/* ===================================== */}

<div className="h-[15px]" />


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
        text-[24px]
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
        text-[14px]
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

<div className="h-[15px]" />

    {/* STEPS */}

    <div
  className="
    relative
    left-[20px]
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
    h-[400px]
  "
>

  {/* ===================================== */}
  {/* INVISIBLE SPACER */}
  {/* ===================================== */}

  <div className="h-[5px]" />

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
        text-[24px]
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
        text-[14px]
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

    <div className="h-[15px]" />

    {/* STEPS */}

    <div
      className="
        relative
        left-[20px]
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

    <div className="h-[10px]" />

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
    Flex Token
  </label>



  <input
    value={editFlexToken}
    onChange={(e) =>
      setEditFlexToken(
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
  Save Changes
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

</>

);

}