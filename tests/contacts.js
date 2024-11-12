import chai from "chai";
import chaiHttp from "chai-http";
import { startServer } from "../server";
import { should } from "chai";

chai.use(chaiHttp);
