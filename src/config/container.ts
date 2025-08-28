import { Container } from "inversify";
import { Argon2Service, IHasherService } from "../services/argon2.service";
import { TYPES } from "./types";

const container = new Container();

container.bind<IHasherService>(TYPES.IHasherService).to(Argon2Service);

export { container };
