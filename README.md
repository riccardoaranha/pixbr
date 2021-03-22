# pixbr

Biblioteca TypeScript para gerar QR Code do PIX, de acordo com as regras do Banco Central Brasileiro. 

Na versão 1.0 está implementado todas as regras de negócio de uma mensagem estática, de acordo com o padrão descrito [nesse](https://www.bcb.gov.br/content/estabilidadefinanceira/forumpireunioes/Anexo%20I%20-%20Padr%C3%B5es%20para%20Inicia%C3%A7%C3%A3o%20do%20PIX.pdf)documento do BCB.


# Instalação

Para usar a biblioteca, basta instalá-la pelo npm, com o seguinte comando.
```bash
npm i pixbr
```

# Uso básico

Importar a biblioteca

```js
import * as PIX from 'pixbr';
```
Criação da mensagem estática
```js
var msg = new PIX.Messages.Static('fulano2019@example.com', /* chave PIX do recebedor*/
                                  'FULANO DE TAL', /* Nome do Recebedor */
                                  'BRASILIA' /* Cidade do Recebedor */ );
```

Adicionando valor de um novo campo, no caso, valor a ser cobrado
```js 
msg.setField(new PIX.Fields.Transaction_Amount(1234.17)); 
```

E por último, gerar o QRCode, como um buffer de bytes:

```js
PIX.QRCode.toPNG(msg.getStringValue(), function (data) {
	console.log(data);
});
```

ou como uma string de dataURL:

```js
PIX.QRCode.toDataURL(msg.getStringValue(), function (data) {
	console.log(data);
});
```

# Detalhes de implementação

## PIX.Fields

Definição de campos. 

### Interface padrão. 

A interface `PIX.Fields.IField<T>` deve ser implementada por todo campo, onde `<T>` é o tipo do valor. Define que o campo tem que ter os seguintes atributos.

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| `ID` | String | ID do campo de acordo com a documentação de origem|
| `Value` | `<T>` | Valor do campo| 
| `TextValue` | String | Valor do campo como texto, que será implementado na mensagem final|
| `Min_length` | Number | Tamanho mínimo do valor em formato texto|
| `Max_length` | Number | Tamanho máximo do valor em formato texto|
| `setValue(value : T) : void` | Função | Função para alterar o valor do campo |
| `validate() : void` | Função | Função de validação do campo |
| `getStringValue() : string` | Função | Função que retorna o campo em texto para utilizar na formação da mensagem |


### Implementações genéricas tipadas

| Classe |  Descrição |
| --- | --- |
| `abstract class Field<T>` |  Implementação abstrata e incompleta de `IField` |
| `class StrField` |  Campo com valor do tipo String |
| `class NumField` |  Campo com valor do tipo Numérico |
 
`NumField` adiciona também a possibilidade de se colocar um limite máximo e mínimo ao valor, e o número de casas decimais relevantes, nos parâmetros `Min_Value`, `Max_Value` e `Decimals`, respectivamente

### Implementações específicas

Campos com definições de tipos e valores já foram implementados, e recomendá-se usá-los sempre que possível.

* `PIX.Fields.Payload_Format_Indicator`
* `PIX.Fields.Point_Of_Initiation_Method`
* `PIX.Fields.Merchant_Account_Information`
* `PIX.Fields.Merchant_Category_Code`
* `PIX.Fields.Transaction_Currency`
* `PIX.Fields.Transaction_Amount`
* `PIX.Fields.Country_Code`
* `PIX.Fields.Merchant_Name`
* `PIX.Fields.Merchant_City`
* `PIX.Fields.Postal_Code`
* `PIX.Fields.CRC16`
* `PIX.Fields.Additional_Data_Field`
* `PIX.Fields.Unreserved_Templates`

Para saber mais detalhes de cada campo, consulte a documentação do Banco Central.

O campo `PIX.Fields.CRC16` deve receber como parâmetro na função 'setValue' o texto da mensagem até imediatamente antes dele de acordo com a ordem apresentada dos campos.

## PIX.Groups

Alguns campos aceitam mais de um valor subcampo, e com isso são chamados de grupos. O tipo genérico é 
`class Group<T extends Fields.IField<any>>`, que por sua vez, também é uma implementação de `IField<undefined>`.
A diferença principal é que existe a propriedade `Children : Array<T>`, que contém a lista de campos filhos aceitos.

### Implementações específicas

Assim como no caso dos campos, existem grupos já implementados:

* `PIX.Groups.Grp_Merchant_Account_Information`
* `PIX.Groups.Grp_Additional_Data_Field`
* `PIX.Groups.Grp_Unreserved_Templates`

Um exemplo de uso de grupo:
```JS
var grpfield = new PIX.Groups.Grp_Merchant_Account_Information();
grpfield.Children.push(new PIX.Fields.Merchant_Account_Information('01', 'fulano2019@example.com'));
```

O grupo `Grp_Merchant_Account_Information` já inclui por definição um campo filho, com ID *'00'* e valor *'br.gov.bcb.pix'*, conforme a definição do Banco Central.

## PIX.Messages

Mensagem é o conteúdo de todos os campos que serão utilizados para gerar o QRCode. 

Para isso, foi criada a classe genérica `PIX.Messages.Message`:

| Propriedade | Tipo | Descrição |
| --- | --- | --- |
| `validate() : void` | Função | Validação da mensagem |
| `getStringValue() : string` | Função | Retorna o texto final da mensagem, que deverá ser convetido para QRCode |
| `existsField(field_type : any) : boolean` | Função |  Verifica se já existe um campo do tipo passado. |
| `getField(field_type : any) : any` | boolean | Retorna o campo da mensagem do tipo passado. |
| `setField(field : Fields.IField<any>, order_override : number = -1) : void ` | Função | Adiciona um novo campo à mensagem.  |
| `AcceptedFieldList` | `Map<any, AcceptedFieldDefinitions>` | Lista de campos aceitos na mensagem, com Ordem e obrigatoriedade do campo. <br/> Campo que define a mensagem, e serve como base para validação |
| `FieldList` | `Array<MessageFields>` | Campos existentes na mensagem, com sua respectiva ordem | 

### Implementações específicas

A mensagem do tipo QR Code estático é a única atualmente implementada, e deve ser usada sempre que possível.

* `PIX.Messages.Static`

## PIX.Config
PIX.Config é utilizado para configurações que podem ser modificadas em runtime. 

Objeto | Valores | Descrição
--- | --- | ---
`PIX.Config.ValidationType` | `ValidationTypes.Full` **(default)** <br/> `ValidationTypes.None`  | Verifica campos nas mensagens, valores dos campos, e CheckSum, ou não realiza nenhuma verificação.
`PIX.Config.ID_LENGHT` | Int **(default = 2)**  | Tamanho do ID do campo.
--- 
 
A implementação de validação segue o protocolod o Banco Central caso os tipos específicos de mensagem e campo implementados sejam seguidos. Ao se implementar tipos genéricos (Ex: PIX.Message, ou PIX.Field).

Recomenda-se não alterar o `PIX.Config.ID_LENGHT`, caso contrário o padrão do Bacen não será seguido, e a mensagem será inválida.
