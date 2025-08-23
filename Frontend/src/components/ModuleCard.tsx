import { Play, ChevronRight } from 'lucide-react';

interface ModuleCardProps {
  title: string;
  description: string;
  progress: number;
  imageUrl: string;
  isNew?: boolean;
  onClick: () => void;
}

export function ModuleCard({ title, description, progress, imageUrl, isNew, onClick }: ModuleCardProps) {
  return (
    <div 
      onClick={onClick}
      className="relative bg-gray-800 rounded-2xl p-4 mb-4 cursor-pointer hover:bg-gray-750 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white">{title}</h3>
            {isNew && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">NEW</span>
            )}
          </div>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
        <ChevronRight className="text-gray-500 ml-2" size={20} />
      </div>
      
      <div className="relative h-24 mb-3 rounded-lg overflow-hidden">
        <img 
          src={imageUrl} 
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-400 text-sm">Progress</span>
            <span className="text-blue-400 text-sm">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}