import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';
import { isValidObjectId, Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { isValidationOptions } from 'class-validator';

@Injectable()
export class PokemonService {

  constructor(
    @InjectModel( Pokemon.name )
    private readonly pokemonModel: Model<Pokemon>
  ){}


  async create(createPokemonDto: CreatePokemonDto) {
    createPokemonDto.name = createPokemonDto.name.toLowerCase()

    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto)
      return pokemon;
    }
    catch (error) {
      this.handleExceptions(error);
    }

  }

    // async findOne(term: string): Promise<Pokemon | null > {

    // let pokemon: Pokemon | null = null;

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string): Promise<Pokemon> {
    let pokemon: Pokemon | null = null;

    // Si es un número (por no)
    if (!isNaN(+term)) {
      pokemon = await this.pokemonModel.findOne({ no: term });
    }

    // Si es un ID de Mongo
    if (!pokemon && isValidObjectId(term)) {
      pokemon = await this.pokemonModel.findById(term);
    }

    // Si aún no se encontró, buscar por nombre
    if (!pokemon) {
      pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() });
    }

    // Si sigue sin encontrarse, lanzar error
    if (!pokemon) {
      throw new NotFoundException(`Pokemon with id, name or no "${term}" not found`);
    }

  return pokemon;

  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const pokemon = await this.findOne( term );
    if ( updatePokemonDto.name )
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();

    try {
      await pokemon.updateOne( updatePokemonDto)
      return { ...pokemon.toJSON, ...updatePokemonDto};
    }
    catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    // const pokemon = await this.findOne(id);
    // await pokemon.deleteOne();
    // const result = await this.pokemonModel.findByIdAndDelete( id );
    const { deletedCount} = await this.pokemonModel.deleteOne({ _id: id});
    if (deletedCount === 0) {
      throw new BadRequestException(`Pokemon with id "${ id }" not found`)
    }

    return;
  }

  private handleExceptions( error: any) {
    if ( error.code === 11000) {
        throw new BadRequestException(`Pokemon alredy exists in db ${JSON.stringify( error.keyValue )}`);
      }
      console.log(error)
      throw new InternalServerErrorException('Cant create Pokemon, check server logs')
  }

}
