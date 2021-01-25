module.exports = {
    responseToLog: function(response) {
        const date = new Date().toISOString();
        const qname = response.questions[0].name;
        const qclass = response.questions[0].class;
        const qtype = response.questions[0].type;
        const answerText = response.answers.map(x => x.data.toString()).join(',');
        return `${date}: ${qname} ${qclass} ${qtype}? ${answerText}`;
    }
}