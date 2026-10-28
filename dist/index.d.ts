/**
 *  Public type entry for the package.
 *
 *  `src/main.js` is plain JavaScript and its types are generated from the
 *  JSDoc by `tsc` into `dist/main.d.ts`. That file describes the controller
 *  *instance*, but it cannot describe the controller *factory* the way this
 *  package is used: `new VisualController({ ... })`.
 *
 *  TypeScript's declaration emit for a JSDoc function is always
 *  `declare function X(...)` — a call signature with no construct signature —
 *  and a JSDoc type literal cannot express `new (...)` either. Without this
 *  file, `new VisualController()` fails with TS7009 ("'new' expression, whose
 *  target lacks a construct signature").
 *
 *  So the default export is declared here with *both* a call signature and a
 *  construct signature. The runtime is identical either way:
 *  `VisualController` is a function that returns the instance object, and a
 *  constructor returning an object hands that object back. Nothing here
 *  changes the implementation — only how the package is described to
 *  TypeScript.
 *
 *  See the README ("Type declarations") for the full story.
 */
import type { SetCallback, SetupUpdates, VisualControllerInstance } from './main.js';
/**
 *  The controller factory. Callable and constructable — both forms return the
 *  same controller instance.
 */
interface VisualControllerFactory {
    (dependencies?: any): VisualControllerInstance;
    new (dependencies?: any): VisualControllerInstance;
}
declare const VisualController: VisualControllerFactory;
export default VisualController;
export type { SetCallback, SetupUpdates, VisualControllerInstance };
