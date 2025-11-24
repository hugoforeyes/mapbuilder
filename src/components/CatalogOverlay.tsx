import RightPanel from './RightPanel';
import type { MapItem, ToolType } from '../types';

interface CatalogOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTool: ToolType;
  selectedAsset: string | null;
  onSelectAsset: (asset: string) => void;
  onSelectGroup: (group: string[]) => void;
  items: MapItem[];
  onSelectItem: (id: string | null) => void;
  selectedItemId: string | null;
  onDeleteItem: (id: string) => void;
}

const CatalogOverlay = ({
  isOpen,
  onClose,
  selectedTool,
  selectedAsset,
  onSelectAsset,
  onSelectGroup,
  items,
  onSelectItem,
  selectedItemId,
  onDeleteItem
}: CatalogOverlayProps) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-96 h-full bg-zinc-900 shadow-2xl flex flex-col border-l border-zinc-700">
        <div className="flex justify-between items-center p-3 border-b border-zinc-700">
          <h2 className="font-semibold text-zinc-200">Asset Catalog</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <RightPanel
            selectedTool={selectedTool}
            onSelectAsset={onSelectAsset}
            onSelectGroup={onSelectGroup}
            selectedAsset={selectedAsset}
            items={items}
            onSelectItem={onSelectItem}
            selectedItemId={selectedItemId}
            onDeleteItem={onDeleteItem}
          />
        </div>
      </div>
    </div>
  );
};

export default CatalogOverlay;
