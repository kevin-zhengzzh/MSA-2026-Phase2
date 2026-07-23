import PointsHistory from '../pages/PointsHistory'

export default function PointsHistoryModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-50 rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-h-[85vh] overflow-y-auto p-6">
          <PointsHistory />
        </div>
      </div>
    </div>
  )
}
