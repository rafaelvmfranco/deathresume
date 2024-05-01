import { t } from "@lingui/macro";
import { templatesList } from "@reactive-resume/utils";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";


export const TemplatesSection = () => (
  <section id="sample-resumes" className="relative py-24 sm:py-32 bg-violet text-white">
    <div className="container flex flex-col gap-12 lg:min-h-[600px] lg:flex-row lg:items-start">
      <div className="space-y-4 lg:mt-16 lg:basis-96">
        {/* add translations */}
        <h2 className="text-4xl font-bold">Get your resume or be unemployed forever</h2>
        {/* add translations */}
        <p className="leading-relaxed">
          Beautiful ready-to-use resume templates.
        </p>
        {/* add translations */}
        <div className="pt-16">
          <Link to="/dashboard/resumes">

          <button className="bg-reddish text-white uppercase px-12 py-2 rounded-md font-semibold text-lg hover:opacity-80">
            I want my resume
          </button>
          </Link>
        </div>
        
      </div>

      <div className="w-full overflow-hidden lg:absolute lg:right-0 lg:max-w-[55%]">
        <motion.div
          animate={{
            x: [0, templatesList.length * 200 * -1],
            transition: {
              x: {
                duration: 30,
                repeat: Infinity,
                repeatType: "mirror",
              },
            },
          }}
          className="flex items-center gap-x-6"
        >
          {templatesList.map((template, index) => (
            <motion.a
              key={index}
              target="_blank"
              rel="noreferrer"
              href={`/deathresume/client/templates/pdf/${template}.pdf`}
              className="max-w-none flex-none"
              viewport={{ once: true }}
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
            >
              <img
                alt={template}
                loading="lazy"
                src={`/deathresume/client/templates/jpg/${template}.jpg`}
                className=" aspect-[1/1.4142] h-[400px] rounded object-cover lg:h-[600px]"
              />
            </motion.a>
          ))}
        </motion.div>

        <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/2 bg-gradient-to-r from-background to-transparent lg:block" />
      </div>
    </div>
  </section>
);
