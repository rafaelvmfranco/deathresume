import { t } from "@lingui/macro";
import { ArrowRight } from "@phosphor-icons/react";
import { Badge, buttonVariants } from "@reactive-resume/ui";
import { cn } from "@reactive-resume/utils";
import { motion } from "framer-motion";
import Tilt from "react-parallax-tilt";

import { defaultTiltProps } from "@/client/constants/parallax-tilt";

import { Decoration } from "./decoration";

export const IntroSection = () => (
  <section id="hero" className="relative mb-16 bg-white t dark:text-white">
    <Decoration.Grid />
    <Decoration.Gradient />

    <div className="mx-auto max-w-7xl px-6 flex flex-col lg:h-screen lg:items-center lg:px-12 dark:bg-black">
      <motion.div
        className="mx-auto mt-32 max-w-3xl shrink-0 lg:mx-0 lg:mt-0 lg:max-w-xl lg:pt-8"
        viewport={{ once: true }}
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
      >

        {/* translations */}
        <div className="mt-10 space-y-2 text-center pb-6 text-violet dark:text-white text-3xl">
          <h1 className=" font-bold tracking-tight sm:text-5xl">
            Don't be scared.
          </h1>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            It's just an
          </h1>
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            Online resume.
          </h1>
        </div>

        {/* translations */}
        <div className="text-center pb-12 text-violet text-lg dark:text-white">
          <div>
            Everything you need to help you win
          </div>
          <div>
            your win job.
          </div>
        </div>
      </motion.div>

      <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-20">
        <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
          <motion.div
            viewport={{ once: true }}
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <Tilt {...defaultTiltProps}>
              <img
                width={1000}
                height="auto"
                src="/deathresume/screenshots/builder.jpg"
                alt="Death Resume - Screenshot - Builder Screen"
                className="object-cover rounded-lg bg-background/5 shadow-2xl ring-1 ring-foreground/10"
              />
            </Tilt>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);
