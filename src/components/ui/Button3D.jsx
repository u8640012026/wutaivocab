import React from 'react';
import { soundEngine } from '../../services/audio';

export const Button3D = ({
  children,
  onClick,
  variant = 'emerald',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  icon: Icon = null,
  ...props
}) => {
  const handleClick = (e) => {
    if (disabled) return;
    soundEngine.click();
    if (onClick) onClick(e);
  };

  const variants = {
    emerald: 'bg-emerald-500 hover:bg-emerald-400 text-white border-b-4 border-emerald-700 active:border-b-0',
    amber: 'bg-amber-400 hover:bg-amber-300 text-amber-950 font-black border-b-4 border-amber-600 active:border-b-0',
    blue: 'bg-blue-600 hover:bg-blue-500 text-white border-b-4 border-blue-800 active:border-b-0',
    indigo: 'bg-indigo-600 hover:bg-indigo-500 text-white border-b-4 border-indigo-800 active:border-b-0',
    sky: 'bg-sky-500 hover:bg-sky-400 text-white border-b-4 border-sky-700 active:border-b-0',
    purple: 'bg-purple-600 hover:bg-purple-500 text-white border-b-4 border-purple-800 active:border-b-0',
    rose: 'bg-rose-500 hover:bg-rose-400 text-white border-b-4 border-rose-700 active:border-b-0',
    teal: 'bg-teal-500 hover:bg-teal-400 text-white border-b-4 border-teal-700 active:border-b-0',
    cyan: 'bg-cyan-600 hover:bg-cyan-500 text-white border-b-4 border-cyan-800 active:border-b-0',
    lime: 'bg-lime-500 hover:bg-lime-400 text-lime-950 font-black border-b-4 border-lime-700 active:border-b-0',
    wood: 'bg-amber-700 hover:bg-amber-600 text-amber-100 border-b-4 border-amber-900 active:border-b-0',
    stone: 'bg-stone-700 hover:bg-stone-600 text-stone-100 border-b-4 border-stone-900 active:border-b-0',
    slate: 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 border-b-4 border-slate-400 dark:border-slate-900 active:border-b-0',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-xl font-bold gap-1.5',
    md: 'px-5 py-2.5 text-sm sm:text-base rounded-2xl font-black gap-2',
    lg: 'px-7 py-3.5 text-lg rounded-2xl font-black gap-2.5',
    xl: 'px-8 py-4 text-xl sm:text-2xl rounded-3xl font-black gap-3 shadow-lg',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      className={`
        btn-3d inline-flex items-center justify-center transition-all cursor-pointer
        disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:border-b-2
        ${variants[variant] || variants.emerald}
        ${sizes[size] || sizes.md}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5 shrink-0" />}
      {children}
    </button>
  );
};
