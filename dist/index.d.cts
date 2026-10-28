import type { VisualControllerInstance } from './main.d.cts'

interface VisualControllerFactory {
    (dependencies?: any): VisualControllerInstance
    new (dependencies?: any): VisualControllerInstance
}

declare const VisualController: VisualControllerFactory

export = VisualController
