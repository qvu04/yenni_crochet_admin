import { AiOutlineLoading3Quarters } from 'react-icons/ai'

export const GlobalRefreshOverlay = () => (
  <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/10 px-5 pt-24 backdrop-blur-[2px]">
    <div className="flex items-center gap-3 rounded-admin bg-white px-5 py-4 text-sm font-black text-ink shadow-soft ring-1 ring-berry/10">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush text-xl text-ink">
        <AiOutlineLoading3Quarters className="animate-spin" />
      </span>
      Đang tải lại dữ liệu mới nhất...
    </div>
  </div>
)
