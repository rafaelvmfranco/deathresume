import { motion } from "framer-motion";
import { Link } from "react-router-dom";

import { Logo } from "@/client/components/logo";

import { ProductHuntBanner } from "./product-hunt-banner";

export const Header = () => (
  <motion.header
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.3 } }}
    className="w-full"
  >
    <ProductHuntBanner />
    <div className="w-full bg-lightViolet py-3 dark:bg-black container flex items-center justify-between">
      <div>
        <Link to="/deathresume/client">
          <Logo size={48} />
        </Link>
      </div>     
      <div className="flex gap-8 px-20 text-violet">
          <Link to="/deathresume/client/auth/login"><button className="text-violet font-bold uppercase dark:text-white">Log in</button></Link>
          <Link to="/deathresume/client/auth/register"><button className="text-reddish font-bold uppercase">Sign up</button></Link>
      </div>
    </div>
  </motion.header>
);
