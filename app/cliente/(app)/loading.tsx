export default function Loading() {
  return (
    <div>
      <div className="skeleton h-8 w-40 mb-2" />
      <div className="skeleton h-4 w-32 mb-6" />
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="skeleton h-24" />
        <div className="skeleton h-24" />
        <div className="skeleton h-24" />
        <div className="skeleton h-24" />
      </div>
      <div className="skeleton h-40" />
    </div>
  );
}
