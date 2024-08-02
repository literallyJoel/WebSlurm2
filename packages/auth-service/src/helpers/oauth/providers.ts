const Providers: Record<
  string,
  {
    tokenUrl: string;
    requiredFields: string[];
    scopes: string[];
    optionalFields?: string[];
  }
> = {
  Google: {
    tokenUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
    requiredFields: ['clientId', 'clientSecret'],
    scopes: ['openid', 'profile', 'email'],
  },
  MicrosoftEntraId: {
    tokenUrl: 'https://graph.microsoft.com/oidc/userinfo',
    requiredFields: ['tenantId', 'clientId', 'clientSecret'],
    scopes: ['openid', 'profile', 'email'],
  },
  GitHub: {
    tokenUrl: 'https://api.github.com/user',
    requiredFields: ['clientId', 'clientSecret'],
    scopes: ['read:user', 'user:email'],
    optionalFields: ['enerpriseDomain'],
  },
};

export function parseProfile(profile: any, provider: string) {
  switch (provider) {
    case 'Google': {
      return {
        id: profile.id,
        email: profile.email,
        emailVerified: profile.verified_email,
        name: profile.name,
        image: profile.picture,
      };
    }
  }
}

export default Providers;
