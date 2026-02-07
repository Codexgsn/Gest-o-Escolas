const { createResourceAction } = require('./src/app/actions/resources.ts');

async function testCreateResource() {
    const mockResource = {
        name: "Recurso de Teste " + Date.now(),
        type: "Equipamento",
        location: "Sala de Teste",
        capacity: 1,
        equipment: "Cabo, Adaptador",
        imageUrl: "https://via.placeholder.com/150",
        tags: ["teste", "migracao"]
    };

    const adminId = "410544b2-4001-4271-9855-fec4b6a6442a"; // ID do Admin do seed

    try {
        const result = await createResourceAction(mockResource, adminId);
        console.log('Resultado do Teste:', result);
    } catch (error) {
        console.error('Erro no Teste:', error);
    }
}

// Nota: Executar via um ambiente que suporte as importações do Next.js/Typescript
// Como é um 'use server', pode ser difícil rodar puro via node sem transpilação.
// Vou confiar na verificação via logs do terminal se o usuário tentar novamente,
// ou pedir para o usuário testar no navegador.
