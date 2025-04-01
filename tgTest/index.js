import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://dnsslqohucjqugwqjczv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc3NscW9odWNqcXVnd3FqY3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0NDIwMDAsImV4cCI6MjA1OTAxODAwMH0.64P8ExQKNsaMbBOhUXwy7jiQsfkMbV9Fdt90sde_rI4'
const supabase = createClient(supabaseUrl, supabaseKey)
import {Telegraf, Markup} from 'telegraf';
const bot = new Telegraf('7309698920:AAGdWfpr2G4Xaen7vpLa_uyx-bjQ0nPaIR4')

let DiceMessage


bot.start(async (ctx) => {
    ctx.reply('Бросаю кубик')
    async function rollDice() {
        for (let i = 0; i < 160; i++) {
            DiceMessage = await ctx.replyWithDice()
            const {data, error} = await supabase.from('rolls').
            insert ({
                result: DiceMessage.dice.value,
            })
            if (error) {
                console.log(error)
            } else {
                console.log(data)
            }
            
           
        }
    }
    
    rollDice()

    

});


bot.launch()
console.log('bot running')