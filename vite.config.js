//src/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss(),
  ],
  //for docker only
  server:{
    host:true, //allows external /docker accesss
    port : 5173 ,//matches EXPOSE 5173
     watch:{
      usePolling:true,
      interval:100,
     }
  }
});