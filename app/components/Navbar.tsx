import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 py-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-white font-bold text-xl">
          Taryatur Expenses
        </Link>
        <div className="flex space-x-4">
          <Link href="/bus" className="text-gray-300 hover:text-white">
            BUS PAGE
          </Link>
          <Link href="/clientspage" className="text-gray-300 hover:text-white">
            CLIENTS PAGE
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
