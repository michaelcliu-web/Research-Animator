// Pipeline stages shown in the dashboard progress bar, in order. Keys match
// the `status` values the backend sends on the generate_video WebSocket.
export const GENERATION_STAGES = [
  { key: "parsing_pdf", label: "Reading paper" },
  { key: "summarizing", label: "Understanding & simplifying" },
  { key: "generating_storyboard", label: "Planning scenes" },
  { key: "processing_scene", label: "Animating scenes" },
  { key: "concatenating", label: "Assembling video" },
  { key: "done", label: "Result" },
];

export const SKILL_LEVELS = [
  { value: "5th_grade", label: "5th Grade" },
  { value: "10th_grade", label: "10th Grade" },
  { value: "college", label: "College+" },
];

export const DEFAULT_SKILL_LEVEL = "college";

// Sample PDFs bundled in public/research-paper-examples/.
export const EXAMPLE_PAPERS = [
  { file: "PageRankBringingOrdertotheWeb.pdf", title: "PageRank", authors: "Page & Brin, 1998" },
  { file: "NIPS-2017-attention-is-all-you-need-Paper.pdf", title: "Attention Is All You Need", authors: "Vaswani et al., 2017" },
  { file: "MagicNumberSeven-Miller1956.pdf", title: "The Magical Number Seven", authors: "Miller, 1956" },
  { file: "Dunning_Kruger_Effect.pdf", title: "Dunning-Kruger Effect", authors: "Kruger & Dunning, 1999" },
  { file: "Kahneman_Tversky_1979_Prospect_theory.pdf", title: "Prospect Theory", authors: "Kahneman & Tversky, 1979" },
  { file: "playingatariwithdeepreinforcementlearning.pdf", title: "Deep Reinforcement Learning", authors: "Mnih et al., 2013" },
  { file: "nikola-bregovic-entry_tcm18-225169.pdf", title: "The Mpemba Effect", authors: "Bregović" },
  { file: "1953-nature-papers-watson-crick-wilkins-franklin.pdf", title: "DNA Double Helix", authors: "Watson & Crick, 1953" },
  { file: "einstein1905_photoeff.pdf", title: "Photoelectric Effect", authors: "Einstein, 1905" },
  { file: "science.239.4843.992.pdf", title: "High-Temp Superconductors", authors: "Wu et al., 1987" },
];

export const examplePaperUrl = (file) => `/research-paper-examples/${file}`;
