import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"

// 侧栏「最近更新」只收 content/posts/ 下的文章，避免 about、index 这类页面混进来。
// npm 插件不走 .quartz/plugins 注册表，覆盖要直接写进 componentRegistry，
// key 用包名（与 parsePluginSource 解析出来的 spec.name 一致）。
// 这段必须写在 loadQuartzConfig() 之前，配置加载时才会读到。
componentRegistry.setOptionOverrides("@quartz-community/recent-notes", {
  filter: (f: { slug?: string }) => f.slug?.startsWith("posts/") ?? false,
})

const config = await loadQuartzConfig()
export default config
export const layout = await loadQuartzLayout()
