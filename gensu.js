// Menambahkan Dependencies / library

const {
    default: makeWaSocket,
     DisconnectReason,
      useSingleFileAuthState 
} = require ("@adiwajshing/baileys");

const { Boom } = require("@hapi/boom");
const { state, saveState } = useSingleFileAuthState("./login.json");

// OPEN AI CHATGPT

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    apiKey: "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",
});
const openai = new OpenAIApi(configuration);

//Fungsi OpenAI ChatGPT untuk Mendapatkan Respon
async function generateResponse(text) {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0.3,
        max_tokens: 2000,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
    });
    return response.data.choices[0].text;
}



//  Fungsi Utama Gensu Pada Wa Bot

async function connectWhatsApp() {

    // Buat sebuah koneksi baru ke WhatsApp / Login Baru ke WhatsApp
    const sock = makeWaSocket({
        auth : state, 
        printQRInTerminal : true,
        defaultQueryTimeoutMs : undefined
    });

    // Fungsi Koneksi Update / untuk cek koneksi update
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === "close" ) {
            const shouldReconnect = (lastDisconnect.error = Boom)?.output?.statusCode !==
            DisconnectReason.loggedOut;
            console.log("koneksi terputus karena ", lastDisconnect.error, ", hubungkan kembali!", shouldReconnect);
            if(shouldReconnect) {
                connectWhatsApp();
            }
        }
        else if (
            connection === "open"
        ) {
            console.log("Koneksi Tersambung!");
        } 
    });
    sock.ev.on("creds.update", saveState);


    // Fungsi Untuk Memantau Pesan Masuk

    sock.ev.on("messages.upsert", async({messages, type}) => {

        console.log("Tipe Pesan: ", type);
        console.log(messages);
        if(type === "notify" && !messages[0].key.fromMe) {
            try {

            // dapatkan nomor pengirim dan isi pesan / mengambil nomor pengirim dan isi pesan
            const senderNumber = messages[0].key.remoteJid;
                let incomingMessages = messages[0].message.conversation;
         
                // untuk tidak langsung muncul di grup
                if(incomingMessages === "") {
                    incomingMessages = messages[0].message.extendedTextMessage.text;
                }

                // Untuk membuat terdetect huruf besar dan kecil akan dianggap sama setiap pesan
                incomingMessages = incomingMessages.toLowerCase();


                // Dapatkan Info Pesan dari Grup atau bukan
                // Dan Pesan Menyebut Bot atau Tidak
                const isMessageFromGroup = senderNumber.includes("@g.us");
                const isMessageMentionBot = incomingMessages.includes("@6285773287510");


                // Tampilkan Nomor Pengirim dan Isi Pesan
                console.log("Nomor Pengirim:", senderNumber);
                console.log("Isi Pesan:", incomingMessages);

                // Tampilkan Status Pesan dari Grup atau Bukan
                // Tampilkan Status Pesan Menyebut Bot atau Tidak
                console.log("Apakah Pesan dari Grup?", isMessageFromGroup);
                console.log("Apakah Pesan Menyebut Bot?", isMessageMentionBot);
                
                // Kalo misalkan bertanya langsung ke bot dengan DM / JAPRI
                if(!isMessageFromGroup) {
                      // LOGIKA NYA

                // Jika ada yang menirim pesan mengandung kata 'siapa' akan terdektesi
                if(incomingMessages.includes('siapa') && incomingMessages.includes('kamu')) {
                    // Bagian Pengiriman Pesan
                   await sock.sendMessage(
                       senderNumber, 
                       { text: "Saya adalah Gensu" },
                       { quoted: messages[0] }, // Bagian Messages[0] -> bisa diubah menjadi angka 1
                                               // artinya 0 = fungsi reply dan 1 = tanpa menggunakan reply dalam mengirim pesan
                       2000
                       );
               } else {
                
                async function main() {
                    const result = await generateResponse(incomingMessages);
                    console.log(result);

                    await sock.sendMessage(
                        senderNumber, 
                        { text: result + "\n\n" },
                        { quoted: messages[1] }, // Bagian Messages[0] -> bisa diubah menjadi angka 1
                                                // artinya 0 = fungsi reply dan 1 = tanpa menggunakan reply dalam mengirim pesan
                        2000
                        );
                }
                main();
               }
             }
            

                // Kalo misalkan nanya via Group Wa 
                if(isMessageFromGroup && isMessageMentionBot) {

                  // LOGIKA NYA

                // Jika ada yang menirim pesan mengandung kata 'siapa' akan terdektesi
                if(incomingMessages.includes('siapa') && incomingMessages.includes('kamu')) {
                    // Bagian Pengiriman Pesan
                   await sock.sendMessage(
                       senderNumber, 
                       { text: "Saya adalah Gensu" },
                       { quoted: messages[0] }, // Bagian Messages[0] -> bisa diubah menjadi angka 1
                                               // artinya 0 = fungsi reply dan 1 = tanpa menggunakan reply dalam mengirim pesan
                       2000
                       );
               } else {
                async function main() {
                    const result = await generateResponse(incomingMessages);
                    console.log(result);

                    await sock.sendMessage(
                        senderNumber, 
                        { text: result + "\n\n" },
                        { quoted: messages[0] }, // Bagian Messages[0] -> bisa diubah menjadi angka 1
                                                // artinya 0 = fungsi reply dan 1 = tanpa menggunakan reply dalam mengirim pesan
                        2000
                        );
                }
                main();
               }   
             }

                // Jika adaq yang mengirim pesan Ping 

                // // LOGIKA NYA
                // if(incomingMessages === "ping"){
                //     // Bagian Pengiriman Pesan
                //     await sock.sendMessage(
                //         senderNumber, 
                //         { text: "pong!" },
                //         { quoted: messages[0] }, // Bagian Messages[0] -> bisa diubah menjadi angka 1
                //                                 // artinya 0 = fungsi reply dan 1 = tanpa menggunakan reply dalam mengirim pesan
                //         2000
                //         );
                // }

            
              

            }
            catch (error){
                console.log(error);
            }
        }
    });
}

connectWhatsApp().catch((err) => {
    console.log("Ada Masalah Pada Kode: " + err);
});