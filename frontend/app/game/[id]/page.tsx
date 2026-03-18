export default function GamePage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">게임 #{params.id}</h1>
      <p className="text-text-secondary">게임 실행 화면이 여기에 표시됩니다.</p>
    </div>
  );
}
