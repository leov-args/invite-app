import "./styles/tokens.css";
import "./styles/fonts.css";
import "./styles/base.css";
import "./styles/sections.css";
import { initOpening } from "./modules/opening.ts";
import { initMusic } from "./modules/music.ts";
import { initHero } from "./modules/hero.ts";
import { initVocacion } from "./modules/vocacion.ts";
import { initMensaje } from "./modules/mensaje.ts";
import { initMisa } from "./modules/misa.ts";
import { initReveal } from "./modules/reveal.ts";

initOpening();
initMusic();
initHero();
initVocacion();
initMensaje();
initMisa();
initReveal();
