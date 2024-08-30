import TransferV2 from "../components/transfer";

export default function Home() {
  return (
    <main className="app-main relative overflow-hidden">
      <div className="fixed bottom-0 left-0 right-0 top-0 z-[1] flex items-center justify-center">
        <div className="bg-primary lg:bg-primary/40 h-[70vw] w-[70vw] rounded-full blur-[8rem] lg:h-[65vh] lg:w-[65vh]" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 top-0 z-[2] overflow-y-auto">
        <div className="page-container flex min-h-full items-start justify-center !pb-20 lg:items-center">
          <TransferV2 />
        </div>
      </div>
    </main>
  );
}
