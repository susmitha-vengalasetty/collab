import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Dropdown = ({ title, items }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="hover:text-blue-700 transition font-medium"
      >
        {title} ▾
      </button>

      {open && (
        <div className="absolute bg-white shadow-lg rounded-xl mt-3 w-56 p-3 space-y-2 z-50 border">
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
              className="block w-full text-left hover:text-blue-700 transition py-1"
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