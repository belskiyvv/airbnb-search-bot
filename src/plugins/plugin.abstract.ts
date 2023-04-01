export abstract class Plugin {
  static pluginName: string;
  constructor() {}

  abstract register(): void;
}
