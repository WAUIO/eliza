export default defineConfig({
    server: {
        allowedHosts: [
            'chat.evolucia.com',  // Add this line
            'localhost',
            '127.0.0.1'
        ]
    }
})