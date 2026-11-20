/**
 * Host half of the request cost meter.
 *
 * The plugin is deliberately inert on the Host: it registers no service, no
 * tool, no prompt section, and no event listener. The cost figures are folded
 * in the browser from the provider-reported usage already stored in the
 * session log, so nothing here can influence model calls, tool execution, or
 * the contents of a session.
 */
export function apply() {}
