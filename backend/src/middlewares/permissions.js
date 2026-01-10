export function checkPermission(module, action) {
    return (req, res, next) => {
        try {
            const user = req.usuario;
            if(req.usuario.role === 'adminMaster') {
                return next();
            }
            
            if (!user || !user.permissions) return res.status(403).json({ erro: "Permissoes nao carregadas" });
            
            const mod = user.permissions[module];
            
            if (!mod) return res.status(403).json({ erro: `Modulo ${module} nao encontrado` });

            if(!mod[action]) return res.status(403).json({ erro: `Sem permissao para ${action} em ${module}`});

            next();
        } catch (e) {
            console.error("Erro no permission middleware, ", e);
            res.status(400).json({ erro: "Erro ao validar permissao" });
        }
    }
}