import { useNavigate } from 'react-router-dom';

export default function BackButton() {
  const navigate = useNavigate();
  
  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition"
    >
      <span className="text-xl">←</span>
      <span>Back</span>
    </button>
  );
}