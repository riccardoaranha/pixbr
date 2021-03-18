import * as Config from './pix.config'
import * as Utils from './pix.utils';


//Generic Field Definitions

export interface IField<T> {
	ID : string;
	Value : T;
	TextValue : string;
	Min_length : number;
	Max_length : number;

	setValue(value : T) : void;
	validate() : void;
	getStringValue() : string;
}

abstract class Field<T> implements IField<T> {
	ID : string;
	Value : T;
	TextValue : string;
	Min_length : number;
	Max_length : number;

	constructor(id : string, value : T, min_length : number = -1, max_length : number = -1) {
		this.ID = id;
		this.Min_length = min_length;
		this.Max_length = max_length;
		this.Value = value;
		this.TextValue = ''
		this.setValue(value);
	}

	abstract setValue(value : T) : void;

	validate() : void {
		if (this.ID.length != Config.ID_LENGHT)
		{ throw new Utils.PIXError('Invalid ID in PIX_Field.', [this]); }

		if ((this.Min_length != -1 && this.TextValue.length < this.Min_length) || 
			(this.Max_length != -1 && this.TextValue.length > this.Max_length))
		{ throw new Utils.PIXError('Invalid Data in PIX_Field.', [this]); }
	}

	getStringValue() : string {
		if (Config.ValidationType == Config.ValidationTypes.Full)
		{ this.validate(); }
		return this.ID + Utils.zeroPad(this.TextValue.length, 2) + this.TextValue;
	}
}

class StrField extends Field<string> {
	constructor(id : string, value : string = '', min_length : number = -1, max_length : number = -1) {
		super(id, value, min_length, max_length);
	}

	setValue(value : string) : void {
		this.Value = value;
		this.TextValue = value;
		if (Config.ValidationType == Config.ValidationTypes.Full)
		{ this.validate(); }
	}
}

class NumField extends Field<number> {
	Min_Value : number;
	Max_Value : number;
	Decimals : number;

	constructor(id : string, value : number, min_length : number = -1, max_length : number = -1, 
				min_value : number = -999999, max_value : number = -999999,  decimals : number = 0) {
		super(id, value, min_length, max_length);
		this.Min_Value = min_value;
		this.Max_Value = max_value;
		this.Decimals = decimals;
		this.setValue(value);
	}

	validate() : void {
		Field.prototype.validate.call(this);
		if ((this.Min_Value != -999999 && this.Value < this.Min_Value) || 
			(this.Max_Value != -999999 && this.Value > this.Max_Value))
		{ throw new Utils.PIXError('Invalid Data in PIX_IntField.', [this]); }
	}

	setValue(value : number) : void {
		this.Value = value;
		if (this.Decimals == 0)
		{ this.TextValue = value.toString(); }
		else 
		{ this.TextValue = value.toFixed(this.Decimals); }

		if (Config.ValidationType == Config.ValidationTypes.Full)
		{ this.validate(); }
	}
}


//Specific  Field Definitions
class Payload_Format_Indicator     extends StrField { constructor(value : string = '01')      { super('00', value, 2, 2); }}
class Point_Of_Initiation_Method   extends StrField { constructor(value : string = '11')      { super('01', value, 2, 2); }} //TODO: dictionary of accepted values
class Merchant_Account_Information extends StrField { constructor(id: string, value : string) { super(id, value, 1, 99); }} 
class Merchant_Category_Code       extends StrField { constructor(value : string = '0000')    { super('52', value, 4, 4); }} //TODO: dictionary of accepted values (https://stripe.com/docs/issuing/categories)
class Transaction_Currency         extends StrField { constructor(value : string = '983')     { super('53', value, 3, 3); }} //TODO: dictionary of accepted values
class Transaction_Amount           extends NumField { constructor(value : number)             { super('54', value, 1, 13, 0, 9999999999.99, 2); }}
class Country_Code                 extends StrField { constructor(value : string = 'BR')      { super('58', value, 2, 2); }}
class Merchant_Name                extends StrField { constructor(value : string)             { super('59', value, 1, 25); }}
class Merchant_City                extends StrField { constructor(value : string)             { super('60', value, 1, 15); }}
class Postal_Code                  extends StrField { constructor(value : string)             { super('61', value, 1, 99); }}
class CRC16                        extends StrField { constructor()                           { super('63', '', 4, 4); }
	setValue(value : string) {
		this.Value = value;
		this.TextValue = Utils.computeCRC(this.Value + this.ID + '04');
	}
}
class Additional_Data_Field        extends StrField   { constructor(id: string, value : string) { super(id, value, 1, 99); }} 
class Unreserved_Templates         extends StrField   { constructor(id: string, value : string) { super(id, value, 1, 99); }} 

export { Field, StrField, NumField, Payload_Format_Indicator, Point_Of_Initiation_Method, Merchant_Account_Information, Merchant_Category_Code, 
Transaction_Currency, Transaction_Amount, Country_Code, Merchant_Name, Merchant_City, Postal_Code, CRC16, Additional_Data_Field, Unreserved_Templates }