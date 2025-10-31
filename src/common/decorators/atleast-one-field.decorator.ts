import { registerDecorator, ValidationArguments,ValidationOptions } from "class-validator";



export function AtLeastOneField(validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            name: 'AtleastOneField',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const obj= args.object
                    return Object.values(obj).some(v => v !== undefined)
                },
                defaultMessage() {
                    return 'At least one field must be provided'
                }
            }
        })
    }
}