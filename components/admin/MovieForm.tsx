
import React, { useState, useEffect } from 'react';
import type { Movie } from '../../types';

interface MovieFormProps {
  onSubmit: (data: Omit<Movie, 'id' | 'createdAt'>) => void;
  initialData?: Movie | null;
  onCancel: () => void;
}

type FormData = Omit<Movie, 'id' | 'createdAt'>;

const predefinedGenres = [
  'أكشن', 'مغامرات', 'أنميشن', 'كوميدي', 'جريمة', 'وثائقي', 'دراما', 
  'عائلي', 'فانتازيا', 'رعب', 'غموض', 'إثارة', 'خيال علمي', 'رياضي', 
  'موسيقى', 'قصير', 'غربي'
].sort((a, b) => a.localeCompare(b, 'ar'));


const MovieForm: React.FC<MovieFormProps> = ({ onSubmit, initialData, onCancel }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    posterUrl: '',
    backdropUrl: '',
    year: new Date().getFullYear(),
    genres: [],
    servers: [{ name: 'Server 1', url: '', quality: '720p' }],
    downloadUrl: '',
    trailerUrl: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        genres: initialData.genres || [],
        servers: initialData.servers && initialData.servers.length > 0 ? initialData.servers : [{ name: 'Server 1', url: '', quality: '720p' }],
        trailerUrl: initialData.trailerUrl || '',
      });
    } else {
        setFormData({
            title: '', description: '', posterUrl: '', backdropUrl: '',
            year: new Date().getFullYear(), genres: [],
            servers: [{ name: 'Server 1', url: '', quality: '720p' }], downloadUrl: '',
            trailerUrl: '',
        });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'year' ? parseInt(value) : value }));
  };

  const handleGenreCheckboxChange = (genre: string) => {
    setFormData(prev => {
        const currentGenres = prev.genres || [];
        const newGenres = currentGenres.includes(genre)
            ? currentGenres.filter(g => g !== genre)
            : [...currentGenres, genre];
        return { ...prev, genres: newGenres };
    });
  };
  
  const handleServerChange = (index: number, field: string, value: string) => {
    const newServers = [...formData.servers];
    newServers[index] = { ...newServers[index], [field]: value };
    setFormData(prev => ({ ...prev, servers: newServers }));
  };

  const addServer = () => {
    setFormData(prev => ({
      ...prev,
      servers: [...prev.servers, { name: `Server ${prev.servers.length + 1}`, url: '', quality: '720p' }]
    }));
  };

  const removeServer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      servers: prev.servers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (formData.genres.length === 0) {
      alert("الرجاء اختيار فئة واحدة على الأقل.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-8 rounded-lg space-y-6 mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">{initialData ? 'تعديل الفيلم' : 'إضافة فيلم جديد'}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="عنوان الفيلم" required className="bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none"/>
        <input type="number" name="year" value={formData.year} onChange={handleChange} placeholder="سنة الإنتاج" required className="bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none"/>
      </div>
      
      <textarea name="description" value={formData.description} onChange={handleChange} placeholder="وصف الفيلم" required className="w-full bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none h-32"/>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <input type="url" name="posterUrl" value={formData.posterUrl} onChange={handleChange} placeholder="رابط صورة البوستر" required className="bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none"/>
        <input type="url" name="backdropUrl" value={formData.backdropUrl} onChange={handleChange} placeholder="رابط صورة الخلفية" required className="bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none"/>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">الفئات (اختر واحدة على الأقل)</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 bg-gray-700 p-4 rounded-md border border-gray-600">
            {predefinedGenres.map(genre => (
                <label key={genre} className="flex items-center gap-2 text-white cursor-pointer hover:text-cyan-400 transition-colors duration-200">
                    <input
                        type="checkbox"
                        checked={formData.genres.includes(genre)}
                        onChange={() => handleGenreCheckboxChange(genre)}
                        className="h-5 w-5 text-cyan-500 bg-gray-800 border-gray-600 rounded focus:ring-cyan-600 focus:ring-offset-gray-700"
                    />
                    <span>{genre}</span>
                </label>
            ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="url" name="downloadUrl" value={formData.downloadUrl ?? ''} onChange={handleChange} placeholder="رابط التحميل (اختياري)" className="w-full bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none"/>
          <input type="url" name="trailerUrl" value={formData.trailerUrl ?? ''} onChange={handleChange} placeholder="رابط المقطع الدعائي (اختياري)" className="w-full bg-gray-700 text-white p-3 rounded-md focus:ring-2 focus:ring-cyan-500 border-none outline-none"/>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-2">سيرفرات المشاهدة</h3>
        {formData.servers.map((server, index) => (
          <div key={index} className="flex items-center gap-2 mb-2 p-2 bg-gray-700 rounded-md">
            <input type="text" value={server.name} onChange={(e) => handleServerChange(index, 'name', e.target.value)} placeholder="اسم السيرفر" className="bg-gray-600 p-2 rounded-md flex-1"/>
            <input type="url" value={server.url} onChange={(e) => handleServerChange(index, 'url', e.target.value)} placeholder="رابط السيرفر" required className="bg-gray-600 p-2 rounded-md flex-grow-[2]"/>
            <input type="text" value={server.quality} onChange={(e) => handleServerChange(index, 'quality', e.target.value)} placeholder="الجودة" className="bg-gray-600 p-2 rounded-md flex-1"/>
            <button type="button" onClick={() => removeServer(index)} className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600">X</button>
          </div>
        ))}
        <button type="button" onClick={addServer} className="mt-2 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-500">إضافة سيرفر</button>
      </div>

      <div className="flex justify-end gap-4">
        <button type="button" onClick={onCancel} className="bg-gray-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-500 transition-colors">إلغاء</button>
        <button type="submit" className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors">{initialData ? 'تحديث' : 'إضافة'}</button>
      </div>
    </form>
  );
};

export default MovieForm;