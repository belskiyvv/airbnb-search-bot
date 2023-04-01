import { Plugin } from './plugin.abstract';

export class PluginsManager {
  constructor(
    private plugins: Plugin[] = [],
  ) {}

  register() {
    this.plugins.forEach((plugin) => plugin.register());
  }

  add(plugin: Plugin) {
    this.plugins.push(plugin);
  }
}
