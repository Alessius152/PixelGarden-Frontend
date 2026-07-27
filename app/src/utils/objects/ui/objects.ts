import type { Variants } from "framer-motion"

/*questo lo uso nelle card delle pixelart nello scenario del working layer*/
const textVariants_pixelartCard = {
    initial: { x: 0, color: '#000' },
    hover: { x: 5, color: 'var(--color-sakura-deep)' }
}








/*queste le uso nella view dello scenario del pixelart editing*/
const containerVariants_pixelartEditingScenario: Variants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { staggerChildren: 0.1, duration: 0.5 } 
    }
}
const sideElementVariants_pixelartEditingScenario: Variants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { ease: "easeOut" } }
}

const rightSideVariants_pixelartEditingScenario: Variants = {
    hidden: { x: 20, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { ease: "easeOut" } }
}

const centerVariants_pixelartEditingScenario: Variants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.4 } }
}







export {
    textVariants_pixelartCard,
    centerVariants_pixelartEditingScenario,
    containerVariants_pixelartEditingScenario,
    rightSideVariants_pixelartEditingScenario,
    sideElementVariants_pixelartEditingScenario,
}
