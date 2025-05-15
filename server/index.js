import { server } from "./server.js"
server.listen(process.env.PORT || 3001, () => console.log("listening"))
