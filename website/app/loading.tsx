export default function Loading() {
  return (
    <div className="min-h-screen bg-[#080810] px-4 py-4 text-white sm:px-6">
      <main className="mx-auto max-w-[980px]">
        <div className="mb-6 border-b border-[#1a1a28] pb-5">
          <div className="h-5 w-44 rounded bg-[#11111f]" />
          <div className="mt-2 h-4 w-64 rounded bg-[#11111f]" />
          <div className="mt-4 h-4 w-full max-w-[520px] rounded bg-[#11111f]" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="rounded-[14px] border border-[#1a1a28] bg-[#0e0e1a] p-[14px]">
              <div className="h-[72px] rounded-[10px] bg-[#11111f]" />
              <div className="mt-3 h-4 w-3/4 rounded bg-[#11111f]" />
              <div className="mt-2 h-3 w-1/2 rounded bg-[#11111f]" />
              <div className="mt-3 h-3 w-full rounded bg-[#11111f]" />
              <div className="mt-1 h-3 w-5/6 rounded bg-[#11111f]" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
