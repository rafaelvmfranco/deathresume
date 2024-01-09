import { Link } from "react-router-dom";
import { t } from "@lingui/macro";
import { ArrowRight } from "@phosphor-icons/react";
import { Badge, buttonVariants } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

import { defaultTiltProps } from "@/client/constants/parallax-tilt";

import { Decoration } from "./decoration";
import { Header } from "../../components/header"

export const HeroSection = () => (
  <section id="hero" className="bg-lightViolet dark:bg-black">
    <Decoration.Grid />
    <Decoration.Gradient />
    <Header/>
    <div className="mx-auto max-w-7xl  lg:flex lg:h-screen lg:items-center">
      <motion.div
        viewport={{ once: true }}
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
      >
        
        <div className="w-lvw px-12">
         <img src="src/assets/logos/logo-big.png" alr="Rip Unemployment - Death Resume" className="w-full h-100 object-cover px-16"/> 
        </div>
        
        <div className="mt-10 space-y-2 text-center text-violet font-black">
          <h1 className="text-5xl font-bold tracking-tight lg:text-7xl">
            {/* translation */}
            Murder your
          </h1>
          <h1 className="text-5xl font-bold tracking-tight lg:text-7xl">
           {/* translation */}
           unemployment
          </h1>
        </div>

           {/* translation */}
        <div className="text-violet mt-6 text-base text-center leading-8 dark:text-white">
          <div>You have only one certainty in life: the death...</div>
          <div>of yout unemployment if you get a resume with me</div>

        </div>
        
        {/* translation */}
        <div className="pt-8 pb-20 flex justify-center">
          <div>
            <Link to="/dashboard/resumes">
              <button className="bg-reddish text-white uppercase px-12 py-2 rounded-md font-semibold text-2xl hover:opacity-80">
              Create my resume
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

    </div>
  </section>
);
