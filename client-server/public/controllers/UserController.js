class UserController {
    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formEl = document.getElementById(formIdCreate);
        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.tableEl = document.getElementById(tableId);
        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit() {
        //adiciona o evento do botão cancelar
        document.querySelector("#box-user-update .btn-cancel").addEventListener("click", e=>{
            this.showPanelCreate();
        })

        this.formUpdateEl.addEventListener("submit", event=>{
            event.preventDefault();
            let btn = this.formUpdateEl.querySelector("[type=submit]");
            btn.disabled = true;
            let values = this.getValues(this.formUpdateEl);
            let index = this.formUpdateEl.dataset.trIndex;
            let tr = this.tableEl.rows[index];
            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({}, userOld, values); //irá substituir os valores do usuário antigo pelo novo, nessa função o que está a direita substitui o que está à esquerda

            this.getPhoto(this.formUpdateEl).then(    
                (content) => {

                    if (!values.photo) {
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content;
                    }

                    let user = new User();

                    user.loadFromJSON(result);

                    user.save().then(user => {
                        this.getTr(user, tr);

                        this.updateCount();

                        this.formUpdateEl.reset();

                        btn.disabled = false;

                        this.showPanelCreate();
                    });
                }, (e) => {
                    console.error(e);
                }
            );
        })
    }

    addEventsTr(tr) {

        tr.querySelector(".btn-delete").addEventListener("click", e=>{
            if(confirm("Deseja realmente excluir?")) {
                let user = new User();

                user.loadFromJSON(JSON.parse(tr.dataset.user));

                user.remove().then(data => {
                    tr.remove();
                    this.updateCount();
                });
            }
        })

        tr.querySelector(".btn-edit").addEventListener("click", e=>{
            let json = JSON.parse(tr.dataset.user);
            let form = document.querySelector("#form-user-update");

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for(let name in json) {
                let field = form.querySelector("[name="+ name.replace("_", "") +"]");

                if(field) {
                    switch(field.type) {
                        case 'file':
                            continue;
                            break;
                        case 'radio':
                            //pega o field do tipo radio e vai direto no input que corresponde ao value do json
                            field = form.querySelector("[name="+ name.replace("_", "") +"][value="+ json[name] +"]");
                            //marca esse input
                            field.checked = true;
                            break;
                        case 'checkbox':
                            field.checked = json[name];
                            break;
                        default:
                            field.value = json[name];
                            break;
                    }
                }
            }

            this.formUpdateEl.querySelector(".photo").src = json._photo;

            this.showPanelUpdate();
        });
    }

    onSubmit() {
        this.formEl.addEventListener("submit", event /**com um parâmetro só não precisa passar parênteses */ => {
            event.preventDefault();
            let btn = this.formEl.querySelector("[type=submit]");
            btn.disabled = true;
            let values = this.getValues(this.formEl);

            if(!values) return false;

            this.getPhoto(this.formEl).then(    
                (content) => {
                    values.photo = content;

                    values.save().then(user => {
                        this.addLine(values);
                        this.formEl.reset();
                        btn.disabled = false;
                    });
                }, (e) => {
                    console.error(e);
                }
            );
        });
    }

    getPhoto(formEl) {
        return new Promise((resolve, reject) => {
            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item=>{
                if (item.name == "photo") {
                    return item;
                }
            });
    
            let file = elements[0].files[0];
    
            fileReader.onload = () => {
                resolve(fileReader.result);
            }

            fileReader.onerror = (e) => {
                reject(e);
            }

            if(file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve("dist/img/boxed-bg.jpg");
            }
        })
    }

    getValues(formEl) {
        let user = {};
        let isValid = true;

        //transforma o objeto literal em array para poder usar o forEach()
        [...formEl.elements].forEach(function (field, index) {

            if(['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error');
                isValid = false;
            }

            if(field.name == "gender") {
                if(field.checked) {
                    user[field.name] = field.value;    
                }
            } else if(field.name == "admin") {
                user[field.name] = field.checked;
            } else {
                user[field.name] = field.value;
            }
        });
    
        if (isValid) {
            return new User(
                user.name,
                user.gender,
                user.birth,
                user.country,
                user.email,
                user.password,
                user.photo,
                user.admin
            );
        } else {
            return false;
        }
    }

    selectAll() {
        User.getUsers().then(data => {
            data.users.forEach(dataUser=> {

                // precisa virar um new user
                let user = new User();
    
                //transforma em json
                user.loadFromJSON(dataUser);
    
                this.addLine(user);
            })
        });
    }

    addLine(dataUser) {

        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr);

        this.updateCount(); //atualiza quantos usuários e admin tem cadastrado
    }

    getTr(dataUser, tr = null) {
        if(tr === null) tr = document.createElement("tr"); //caso não for passado é criado

        tr.dataset.user = JSON.stringify(dataUser); //será usado para pegar essa informação

        tr.innerHTML = `
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${Utils.dateFormat(dataUser.register)}</td>
            <td>
            <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        `;

        this.addEventsTr(tr);

        return tr;
    }

    showPanelCreate() {
        document.querySelector("#box-user-update").style.display = "none";
        document.querySelector("#box-user-create").style.display = "block";
    }

    showPanelUpdate() {
        document.querySelector("#box-user-create").style.display = "none";
        document.querySelector("#box-user-update").style.display = "block";        
    }

    updateCount() {
        let numberUsers = 0;
        let numberAdmin = 0;

        //converte a coleção para array
        [...this.tableEl.children].forEach(tr=>{
            numberUsers++;

            let user = JSON.parse(tr.dataset.user);
            if(user._admin) numberAdmin++; //Se existir o admin, adiciona mais um na variável
        });

        document.querySelector("#number-users").innerHTML = numberUsers;
        document.querySelector("#number-users-admin").innerHTML = numberAdmin;
    }
}