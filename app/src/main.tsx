import './index.css'

import { createRoot } from 'react-dom/client'
import { system } from '@chakra-ui/react/preset'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'

import { ChakraProvider } from '@chakra-ui/react'
import { DeviceDetectorProvider } from './contexts/DeviceDetectorContext.tsx'

import axios from 'axios'

axios.defaults.headers.common['Content-Type'] = 'application/json'
axios.defaults.validateStatus = ()=>true

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <ChakraProvider value={system}>
      <DeviceDetectorProvider>
        <App />
      </DeviceDetectorProvider>
    </ChakraProvider>
  </QueryClientProvider>
)
