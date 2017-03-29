const net = require('net');

const config = {
    ssh: {
        ip: '127.0.0.1',
        port: 22
    },
    rdp: {
        ip: '172.16.40.8',
        port: 3389
    }
}

const server = net.createServer((s) => {
    let handshake = false;
    s.on('data', (d) => {
        if(!handshake){
            handshake = true;
        }else{
            return;
        }
        let cli,type;
        if(d[0] == 83 && d[1] == 83 && d[2] == 72){
            cli = net.createConnection(config.ssh.port,config.ssh.ip);
            type = 'SSH';
        }else{
            cli = net.createConnection(config.rdp.port,config.rdp.ip);
            type = 'RDP';
        }
        console.log('TYPE: ' + type + ' IP: ' + s.remoteAddress + ' PORT: ' + s.remotePort);
        cli.on('connect', ()=> {
            cli.write(d);
            cli.pipe(s);
            s.pipe(cli);
        });
        cli.on('error', function() {
            cli.destroy();
            cli.unref();
            s.destroy();
            s.unref();
        });
    });

    s.on('error', function() {
        s.destroy();
        s.unref();
    });
});


server.listen(3389, () => {
    try{
      process.setgid('nobody');
      process.setuid('nobody');
    }catch(e){
      console.warn('Unable to drop root');
    }
    console.log('Server created');
});