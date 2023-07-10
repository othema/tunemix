import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { MantineProvider } from "@mantine/core";
import { ContextMenuProvider } from 'mantine-contextmenu';


ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <MantineProvider
    withGlobalStyles
    withNormalizeCSS
    theme={{
      colorScheme: "dark",
      primaryColor: "indigo"
    }}
  >
    <ContextMenuProvider
      shadow="lg"
      borderRadius="sm"
    >
      <App />
    </ContextMenuProvider>
  </MantineProvider>
)

postMessage({ payload: 'removeLoading' }, '*')
