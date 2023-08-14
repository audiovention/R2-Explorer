import {OpenAPIRoute, Path, Query} from "@cloudflare/itty-router-openapi";
import {Context} from "../../interfaces";
import {OpenAPIRouteSchema} from "@cloudflare/itty-router-openapi/dist/src/types";
import {z} from "zod";

export class RenameObject extends OpenAPIRoute {
  static schema: OpenAPIRouteSchema = {
    operationId: 'post-bucket-rename-object',
    tags: ['Buckets'],
    summary: 'Rename object',
    parameters: {
      bucket: Path(String),
    },
    requestBody: {
      oldKey: z.string().optional().describe('base64 encoded file key'),
      newKey: z.string().optional().describe('base64 encoded file key'),
    }
  }

  async handle(
    request: Request,
    env: any,
    context: Context,
    data: any
  ) {
    if (context.config.readonly === true) return Response.json({msg: 'unauthorized'}, {status: 401})

    const bucket = env[data.params.bucket]
    const oldKey = decodeURIComponent(escape(atob(data.body.oldKey)))
    const newKey = decodeURIComponent(escape(atob(data.body.newKey)))

    const object = await bucket.get(oldKey)
    const resp = await bucket.put(newKey, object.body, {customMetadata: object.customMetadata})

    await bucket.delete(oldKey)

    return resp
  }
}
