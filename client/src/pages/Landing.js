import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sprout,
  Rocket,
  Leaf,
  Users,
  Gamepad2,
  Globe2,
  GraduationCap,
  Map,
  Recycle,
  Sun,
  Droplet,
  Bird,
  TreePine,
  Sparkles,
  ArrowRight,
  Trophy,
  Compass,
  ClipboardCheck,
  School,
} from "lucide-react";
import { EcoQuestNav, EcoLogo } from "../components";
import {
  FadeInSection,
  HoverCard,
  AnimatedButton,
  staggerItem,
  staggerContainer,
} from "../components/motion";
import { useAuth } from "../context/AuthContext";
import { useCountUp } from "../hooks/useCountUp";

const easeOut = [0.22, 1, 0.36, 1];

const heroIconStrip = [
  { Icon: Leaf, color: "text-emerald-600", tip: "Plant trees" },
  { Icon: Droplet, color: "text-sky-600", tip: "Save water" },
  { Icon: Sun, color: "text-amber-500", tip: "Clean energy" },
  { Icon: Recycle, color: "text-teal-600", tip: "Reduce waste" },
];

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#E3F2FD]/90 via-white to-[#F9FAF7]" />
      <div className="absolute top-20 right-0 w-80 h-80 bg-eco-primary/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-64 h-64 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="relative max-w-4xl mx-auto px-6 pt-10 pb-14 sm:pt-16 sm:pb-18 text-center"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: easeOut }}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.5, ease: easeOut }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border border-amber-100 text-amber-900/90 text-sm font-semibold mb-5 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-600" strokeWidth={2.2} />
          Learn · Play · Save the Planet
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.55, ease: easeOut }}
          className="font-display font-bold text-4xl sm:text-5xl md:text-6xl text-[#2D332F] leading-[1.08] mb-4 flex flex-wrap items-center justify-center gap-2"
        >
          <span>Become an</span>
          <span className="text-[#5E9F57]">Eco Hero</span>
          <span className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-sky-100 text-sky-600 shadow-md">
            <Rocket className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={2.2} />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl sm:text-2xl font-display font-semibold text-[#5E9F57] tracking-tight mb-2"
        >
          Small actions. Big impact.
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto mb-8 leading-relaxed"
        >
          Start with one mission. Change the planet.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5, ease: easeOut }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-stretch sm:items-center"
        >
          <AnimatedButton to="/signup" variant="primary" className="min-w-[240px] sm:min-w-[260px]">
            <Rocket className="w-5 h-5" strokeWidth={2.2} />
            Start Your Eco Journey
          </AnimatedButton>
          <AnimatedButton href="#features" variant="secondary" className="min-w-[200px]">
            <Compass className="w-5 h-5 text-eco-primary" strokeWidth={2} />
            Explore Demo
          </AnimatedButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.55, ease: easeOut }}
          className="mt-14 flex flex-wrap justify-center gap-5 sm:gap-6"
        >
          {heroIconStrip.map(({ Icon, color, tip }, i) => (
            <div key={tip} className="group relative">
              <motion.div
                whileHover={{ scale: 1.1, y: -6, rotate: [0, -3, 3, 0] }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="rounded-xl bg-white/95 w-16 h-16 sm:w-[72px] sm:h-[72px] shadow-md border border-gray-100/90 flex items-center justify-center"
              >
                <Icon className={`w-8 h-8 ${color}`} strokeWidth={2} />
              </motion.div>
              <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 -bottom-9 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap rounded-lg bg-[#2D332F] px-2.5 py-1 text-xs font-semibold text-white shadow-lg z-10">
                {tip}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

function TrustStrip() {
  return (
    <FadeInSection className="relative py-11 sm:py-14 px-6 bg-gradient-to-r from-emerald-50/95 via-teal-50/70 to-sky-50/90 border-y border-emerald-100/70">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(16,185,129,0.06)_0%,_transparent_70%)] pointer-events-none" />
      <div className="max-w-4xl mx-auto text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, ease: easeOut }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-[#2D332F]"
        >
          <p className="font-display font-bold text-lg sm:text-xl flex items-center justify-center gap-2">
            <Users className="w-6 h-6 text-eco-primary shrink-0" strokeWidth={2} />
            Trusted by 10,000+ students
          </p>
          <span className="hidden sm:block w-px h-8 bg-emerald-200/80" aria-hidden />
          <p className="font-display font-semibold text-base sm:text-lg text-gray-700 flex items-center justify-center gap-2">
            <School className="w-6 h-6 text-sky-600 shrink-0" strokeWidth={2} />
            Making sustainability fun for schools
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12, duration: 0.45 }}
          className="mt-5 flex justify-center gap-8 text-emerald-700/80"
        >
          <motion.span whileHover={{ scale: 1.15, rotate: -6 }} transition={{ duration: 0.25 }}>
            <Users className="w-5 h-5" strokeWidth={2} />
          </motion.span>
          <motion.span whileHover={{ scale: 1.15, rotate: 6 }} transition={{ duration: 0.25 }}>
            <Leaf className="w-5 h-5" strokeWidth={2} />
          </motion.span>
          <motion.span whileHover={{ scale: 1.15, rotate: -6 }} transition={{ duration: 0.25 }}>
            <Globe2 className="w-5 h-5" strokeWidth={2} />
          </motion.span>
        </motion.div>
      </div>
    </FadeInSection>
  );
}

function formatStatDisplay(value, decimals, format) {
  if (format === "50K+") return `${Math.round(value)}K+`;
  if (format === "1.2M") return `${value.toFixed(1)}M`;
  if (format === "340K") return `${Math.round(value)}K`;
  if (format === "28t") return `${Math.round(value)} tons`;
  return String(value);
}

function StatCard({ icon: Icon, label, end, decimals, format, iconBg, iconColor, glow }) {
  const { ref, value } = useCountUp(end, { decimals: decimals ?? 0 });
  const display = formatStatDisplay(value, decimals ?? 0, format);

  return (
    <HoverCard scale={1.03} y={-4}>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, ease: easeOut }}
        className={`rounded-2xl bg-white p-6 sm:p-7 shadow-md border border-gray-100 text-center group cursor-default ${glow}`}
      >
        <motion.div
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.45 }}
          className={`inline-flex w-14 h-14 sm:w-16 sm:h-16 rounded-2xl items-center justify-center mx-auto mb-4 ${iconBg} shadow-sm group-hover:shadow-md`}
        >
          <Icon className={`w-8 h-8 sm:w-9 sm:h-9 ${iconColor}`} strokeWidth={2} />
        </motion.div>
        <p className="font-display font-bold text-2xl sm:text-3xl text-[#5E9F57] tabular-nums">{display}</p>
        <p className="text-xs sm:text-sm text-gray-500 font-semibold uppercase tracking-wide mt-2">{label}</p>
      </motion.div>
    </HoverCard>
  );
}

function Stats() {
  const stats = [
    {
      icon: Users,
      end: 50,
      decimals: 0,
      format: "50K+",
      label: "Young Explorers",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      glow: "hover:shadow-lg hover:shadow-violet-200/80",
    },
    {
      icon: Gamepad2,
      end: 1.2,
      decimals: 1,
      format: "1.2M",
      label: "Quizzes Played",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      glow: "hover:shadow-lg hover:shadow-amber-200/80",
    },
    {
      icon: Sprout,
      end: 340,
      decimals: 0,
      format: "340K",
      label: "Eco-Missions Done",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      glow: "hover:shadow-lg hover:shadow-emerald-200/80",
    },
    {
      icon: Globe2,
      end: 28,
      decimals: 0,
      format: "28t",
      label: "CO₂ Saved",
      iconBg: "bg-sky-100",
      iconColor: "text-sky-600",
      glow: "hover:shadow-lg hover:shadow-sky-200/80",
    },
  ];

  return (
    <section className="py-12 sm:py-16 px-6 bg-[#F9FAF7]">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}

function WhySection() {
  const items = [
    {
      icon: GraduationCap,
      title: "Fun Eco-Quizzes",
      desc: "Quick quizzes that feel like levels—master topics and unlock your next challenge.",
      iconWrap: "bg-teal-100 text-teal-700",
    },
    {
      icon: Trophy,
      title: "Win Awesome Badges",
      desc: "Collect badges and climb levels—every streak tells your story.",
      iconWrap: "bg-orange-100 text-orange-600",
    },
    {
      icon: Globe2,
      title: "Real-World Missions",
      desc: "Turn learning into action with photo proof and teacher-verified eco tasks.",
      iconWrap: "bg-sky-100 text-sky-700",
    },
    {
      icon: Users,
      title: "Team Up With Friends",
      desc: "See how your school ranks and cheer each other on—together, we go further.",
      iconWrap: "bg-violet-100 text-violet-700",
    },
  ];

  return (
    <section id="features" className="py-16 sm:py-20 px-6 bg-[#F9FAF7] scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <FadeInSection className="text-center mb-12">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-400 items-center justify-center mb-5 shadow-md">
            <Sparkles className="w-7 h-7 text-white" strokeWidth={2.2} />
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#2D332F]">
            Why you&apos;ll love <span className="text-[#5E9F57]">EcoQuest</span>
          </h2>
          <p className="mt-3 text-gray-600 text-lg max-w-xl mx-auto leading-relaxed">
            A playful path from curiosity to real impact—built for students, not slide decks.
          </p>
        </FadeInSection>

        <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: easeOut }}
            >
              <HoverCard scale={1.02} y={-8}>
                <div className="flex gap-5 p-7 sm:p-8 rounded-2xl bg-white shadow-md border border-gray-100/90 hover:shadow-xl transition-shadow duration-300">
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: [0, -4, 4, 0] }}
                    transition={{ duration: 0.4 }}
                    className={`shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center ${item.iconWrap}`}
                  >
                    <item.icon className="w-8 h-8" strokeWidth={2} />
                  </motion.div>
                  <div className="text-left min-w-0">
                    <h3 className="font-display font-bold text-xl text-[#2D332F]">{item.title}</h3>
                    <p className="text-gray-600 mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </HoverCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Create your profile",
      desc: "Sign up in seconds and join your school.",
      icon: Users,
      bg: "from-emerald-400 to-teal-500",
    },
    {
      num: "02",
      title: "Learn & complete missions",
      desc: "Quizzes, tasks, and mini-games that fit your level.",
      icon: ClipboardCheck,
      bg: "from-sky-400 to-blue-500",
    },
    {
      num: "03",
      title: "Earn XP & climb the board",
      desc: "Track impact, badges, and friendly competition.",
      icon: Trophy,
      bg: "from-amber-400 to-orange-500",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 sm:py-20 px-6 bg-white border-y border-gray-100 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <FadeInSection className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#2D332F]">Your journey in three steps</h2>
          <p className="mt-3 text-gray-600 max-w-lg mx-auto">From first login to leaderboard glory—no confusion, just momentum.</p>
        </FadeInSection>

        <motion.div
          variants={staggerContainer(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="relative max-w-5xl mx-auto"
        >
          <div
            className="hidden md:block absolute top-[3.25rem] left-[8%] right-[8%] h-px bg-gradient-to-r from-transparent via-emerald-200/90 to-transparent pointer-events-none"
            aria-hidden
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <motion.div key={s.num} variants={staggerItem} className="relative z-10">
                <div className="h-full rounded-2xl bg-[#F9FAF7] border border-gray-100 p-8 text-center shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <span className="font-display font-bold text-4xl text-emerald-300/90 leading-none">{s.num}</span>
                  <div
                    className={`mx-auto mt-4 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${s.bg} text-white shadow-md`}
                  >
                    <s.icon className="w-7 h-7" strokeWidth={2} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-[#2D332F]">{s.title}</h3>
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function MissionGrid() {
  const missions = [
    {
      title: "Waste Heroes",
      sub: "2.4k missions",
      desc: "Sort, recycle, and cut landfill impact.",
      Icon: Recycle,
      gradient: "from-emerald-400/35 via-emerald-100/90 to-teal-50",
      glow: "hover:shadow-emerald-400/40",
      iconColor: "text-emerald-700",
    },
    {
      title: "Energy Explorers",
      sub: "1.8k missions",
      desc: "Save power and learn clean energy tips.",
      Icon: Sun,
      gradient: "from-amber-300/45 via-amber-50 to-yellow-50",
      glow: "hover:shadow-amber-300/50",
      iconColor: "text-amber-600",
    },
    {
      title: "Water Warriors",
      sub: "1.2k missions",
      desc: "Protect every drop—water wisdom that sticks.",
      Icon: Droplet,
      gradient: "from-sky-400/35 via-sky-50 to-cyan-50",
      glow: "hover:shadow-sky-400/45",
      iconColor: "text-sky-600",
    },
    {
      title: "Animal Friends",
      sub: "960 missions",
      desc: "Habitats, species, and biodiversity wins.",
      Icon: Bird,
      gradient: "from-orange-300/40 via-orange-50 to-rose-50",
      glow: "hover:shadow-orange-300/45",
      iconColor: "text-orange-600",
    },
    {
      title: "Forest Rangers",
      sub: "1.5k missions",
      desc: "Trees, trails, and greener campuses.",
      Icon: TreePine,
      gradient: "from-lime-700/25 via-emerald-100/95 to-green-50",
      glow: "hover:shadow-emerald-400/40",
      iconColor: "text-emerald-800",
    },
  ];

  const MissionCard = ({ m }) => (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.05, y: -6 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${m.gradient} p-6 border border-white/70 shadow-md min-h-[200px] ${m.glow} hover:shadow-[0_20px_50px_-12px_rgba(16,185,129,0.35)]`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <span className="relative z-10 inline-flex w-14 h-14 rounded-2xl bg-white/95 items-center justify-center shadow-md mb-4">
        <m.Icon className={`w-7 h-7 ${m.iconColor}`} strokeWidth={2.2} />
      </span>
      <h3 className="relative z-10 font-display font-bold text-lg text-[#2D332F]">{m.title}</h3>
      <p className="relative z-10 text-sm font-medium text-emerald-900/70 mt-1">{m.sub}</p>
      <p className="relative z-10 text-sm text-gray-700 mt-3 leading-snug">{m.desc}</p>
      <div className="absolute bottom-5 right-5 flex items-center gap-1 font-display font-bold text-sm text-emerald-800 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        Explore
        <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
      </div>
    </motion.div>
  );

  return (
    <section id="missions" className="py-16 sm:py-20 px-6 bg-gradient-to-b from-white to-[#EEF7EF] scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <FadeInSection className="text-center mb-12">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 items-center justify-center mb-5 shadow-lg">
            <Map className="w-6 h-6 text-white" strokeWidth={2.2} />
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#5E9F57]">Choose your mission</h2>
          <p className="mt-3 text-gray-600 text-lg max-w-lg mx-auto leading-relaxed">
            Each world is a new level—pick where your adventure begins.
          </p>
        </FadeInSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {missions.slice(0, 4).map((m) => (
            <MissionCard key={m.title} m={m} />
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03, y: -4 }}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${missions[4].gradient} p-6 sm:p-8 border border-white/70 shadow-md max-w-lg w-full ${missions[4].glow}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <span className="inline-flex w-14 h-14 rounded-2xl bg-white/95 items-center justify-center shadow-md shrink-0">
                <TreePine className={`w-7 h-7 ${missions[4].iconColor}`} strokeWidth={2.2} />
              </span>
              <div className="flex-1">
                <h3 className="font-display font-bold text-xl text-[#2D332F]">{missions[4].title}</h3>
                <p className="text-sm font-medium text-emerald-900/70 mt-1">{missions[4].sub}</p>
                <p className="text-sm text-gray-700 mt-2">{missions[4].desc}</p>
              </div>
              <div className="flex items-center gap-1 font-display font-bold text-sm text-emerald-800 opacity-70 group-hover:opacity-100">
                Explore
                <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-16 sm:py-20 px-6 bg-[#F9FAF7]">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: easeOut }}
        className="max-w-3xl mx-auto relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2E7D32] via-eco-primary to-[#81C784] px-8 py-12 sm:py-14 text-center shadow-xl shadow-emerald-900/20"
      >
        <motion.div
          className="absolute -top-24 -right-16 w-48 h-48 rounded-full bg-lime-300/25 blur-3xl"
          animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-12 w-44 h-44 rounded-full bg-white/20 blur-2xl"
          animate={{ y: [0, 12, 0], x: [0, -6, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="relative z-10">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center mb-5 mx-auto border border-white/25">
            <Globe2 className="w-6 h-6 text-white" strokeWidth={2.2} />
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-white mb-4">
            Ready to start your eco journey?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-lg mx-auto">
            Join thousands of learners turning small habits into measurable impact.
          </p>
          <motion.div
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex"
          >
            <Link
              to="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-100 text-[#3E2723] font-display font-bold text-lg shadow-lg shadow-amber-900/25 hover:shadow-xl hover:shadow-amber-800/35 transition-shadow"
            >
              <Rocket className="w-5 h-5 text-amber-900" strokeWidth={2.2} />
              Start Your Eco Journey Today
              <ArrowRight className="w-5 h-5" strokeWidth={2.2} />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-6">
        <a href="#top" className="flex items-center">
          <EcoLogo size="sm" withText={true} showTagline={false} animated={false} />
        </a>
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <Link to="/login" className="hover:text-[#5E9F57] transition font-medium">
            Login
          </Link>
          <Link to="/signup" className="hover:text-[#5E9F57] transition font-medium">
            Sign up
          </Link>
          <a href="#top" className="hover:text-[#5E9F57] transition font-medium">
            Back to top
          </a>
        </div>
        <p className="text-sm text-gray-500 text-center sm:text-right">
          © {new Date().getFullYear()} EcoQuest · Gamified environmental learning
        </p>
      </div>
    </footer>
  );
}

export default function Landing() {
  const { user } = useAuth();
  const xp = typeof user?.points === "number" ? user.points : 0;

  return (
    <div id="top" className="min-h-screen bg-[#F9FAF7] overflow-x-hidden">
      <EcoQuestNav variant="landing" xp={xp} />
      <main>
        <Hero />
        <TrustStrip />
        <Stats />
        <WhySection />
        <HowItWorks />
        <MissionGrid />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
