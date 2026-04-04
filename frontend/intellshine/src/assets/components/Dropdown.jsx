import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dropdown = ({ title, items }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="transition font-semibold px-3 py-2 rounded-md text-gray-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-gray-700"
      >
        {title} ▾
      </button>

      {open && (
        <div className="absolute card mt-3 w-56 p-3 space-y-1.5 z-50 text-gray-900 dark:text-gray-100">
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (item.path) {
                  navigate(item.path);
                }
                setOpen(false);
              }}
              className="dropdown-item text-gray-700 hover:bg-slate-100 hover:text-blue-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-blue-400"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
