import { LuSearch } from 'react-icons/lu';

export default function Header() {
  return (
    <header className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-extrabold text-pink-700">Good afternoon</h1>
      <LuSearch className="w-7 h-7 text-pink-600 cursor-pointer" /> {/* icon button */}
    </header>
  );
}
