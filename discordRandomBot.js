const fs = require('fs');
const Discord = require('discord.js');
const moment = require('moment');
const {
  prefix,
  token
} = require('./config.json');
const ytdl = require('ytdl-core');
const client = new Discord.Client();

//Music queue
const queue =new Map();

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', async message => {

  if (message.author.bot) {

  } else {
    const serverQueue = queue.get(message.guild.id);
    if(message.content.startsWith(`${prefix}play`)){
      await execute(message, serverQueue);
    }else if(message.content.startsWith(`${prefix}stop`)){
      stop(message, serverQueue);
    }else if(message.content.startsWith(`${prefix}skip`)){
      skip(message, serverQueue);
    }else {
      log(`Something else: ${message}`);
    }

  }
});

async function execute (message, serverQueue){
  const args= message.content.split(" ",2);
  const voiceChannel=message.member.voice.channel;

  if (!voiceChannel){
    return message.channel.send ("Du musst in einem Voicechannel sein");
  }

  const songInfo = await ytdl.getInfo(args[1]);
  const song = {
    title: songInfo.videoDetails.title,
    url: songInfo.videoDetails.video_url,
  };

  if(!serverQueue){
    const queueConstruct= {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing:true
    };
    queue.set(message.guild.id, queueConstruct);

    queueConstruct.songs.push(song);

    try{
      var connection= await voiceChannel.join();
      queueConstruct.connection = connection;
      play(message.guild, queueConstruct.songs[0]);
    } catch (err){
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  }else{
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} wurde zur Playlist hinzugefügt`);
  }
}

function skip(message, serverQueue){
  if(!message.member.voice.channel)
    return message.channel.send("Du bist in keinem Voicechannel");
  if(!serverQueue)
    return message.channel.send("Es gibt keinen Song den ich überspringen kann");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue){
  if(!message.member.voice.channel)
    return message.channel.send("Du bist in keinem Voicechannel");
  if(!serverQueue)
    return message.channel.send("Es gibt keinen Song den ich stoppen kann");
  serverQueue.songs=[];
  serverQueue.connection.dispatcher.end();
}

function play (guild , song){
  const serverQueue =queue.get(guild.id);
  if(!song){
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  const dispatcher = serverQueue.connection
  .play(ytdl(song.url))
  .on("finish",()=>{
    serverQueue.songs.shift();
    play(guild, serverQueue.songs[0]);
  })
  .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume/5);
  serverQueue.textChannel.send(`Spiele Lied ab: ${song.title}`);
}

client.login(token);
