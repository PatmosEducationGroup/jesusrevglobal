FROM node:20-bookworm-slim

# git + GitHub CLI + sudo
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends ca-certificates curl git gnupg sudo; \
    mkdir -p -m 755 /etc/apt/keyrings; \
    curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
      | tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null; \
    chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg; \
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
      > /etc/apt/sources.list.d/github-cli.list; \
    apt-get update; apt-get install -y --no-install-recommends gh; \
    rm -rf /var/lib/apt/lists/*

# Claude Code (global; on PATH for the dev user at runtime)
RUN npm install -g @anthropic-ai/claude-code

# Let runner operate on the dev-owned workspace
RUN git config --system --add safe.directory /workspace

# dev = interactive (Claude Code) | runner = holds the gh creds, does the push
RUN set -eux; \
    groupadd -f app; \
    id -u dev    >/dev/null 2>&1 || useradd --gid app --create-home --shell /bin/bash dev; \
    id -u runner >/dev/null 2>&1 || useradd --user-group --groups app --create-home --shell /bin/bash runner; \
    install -d -o dev  -g app    -m 2775 /workspace; \
    install -d -o root -g runner -m 0750 /etc/runner-secrets

COPY run-as-runner /usr/local/bin/run-as-runner
COPY runx          /usr/local/bin/runx
COPY entrypoint    /usr/local/bin/entrypoint
RUN chmod 0755 /usr/local/bin/run-as-runner /usr/local/bin/runx /usr/local/bin/entrypoint \
 && chown root:root /usr/local/bin/run-as-runner

RUN echo 'dev ALL=(runner) NOPASSWD: /usr/local/bin/run-as-runner' > /etc/sudoers.d/runx \
 && chmod 0440 /etc/sudoers.d/runx

ENTRYPOINT ["/usr/local/bin/entrypoint"]
